// SPDX-License-Identifier: MIT
pragma solidity 0.8.26; 

contract DecentralizedUniversity {

    // ------------------------------------------------
    //                  DATA STRUCTURES
    // ------------------------------------------------
    struct Student {
        uint256 id;
        string name;
        uint8 age;
        string degree;
        address studentAddress; 
        uint256[] enrolledCourses;
    }

    struct Professor {
        uint256 id;
        string name;
        address professorAddress;
        uint256[] teachingCourses;
    }

    struct Course {
        uint256 id;
        string name;
        address professor;
        mapping(address => uint8) grades;
    }

    // ------------------------------------------------
    //                  STATE VARIABLES
    // ------------------------------------------------
    address public admin;

    uint256 public studentCount;
    uint256 public professorCount;
    uint256 public courseCount;

    mapping(uint256 => Student) public students;
    mapping(uint256 => Professor) public professors;
    mapping(uint256 => Course) public courses;

    // Track whether a student is enrolled in a given course
    mapping(uint256 => mapping(uint256 => bool)) public isEnrolled;

    // ------------------------------------------------
    //                      EVENTS
    // ------------------------------------------------
    event StudentAdded(uint256 indexed id, string name, address studentAddress);
    event ProfessorAdded(uint256 indexed id, string name, address professorAddress);
    event CourseCreated(uint256 indexed id, string name, address professorAddress);
    event GradeAssigned(uint256 indexed courseId, address indexed student, uint8 grade);
    event StudentEnrolled(uint256 indexed studentId, uint256 indexed courseId);
    event StudentDroppedCourse(uint256 indexed studentId, uint256 indexed courseId);
    event StudentInfoUpdated(uint256 indexed studentId, string name, uint8 age, string degree);

    // ------------------------------------------------
    //                   MODIFIERS
    // ------------------------------------------------
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyValidStudentId(uint256 studentId) {
        require(studentId > 0 && studentId <= studentCount, "Invalid student ID");
        _;
    }

    modifier onlyValidProfessorId(uint256 professorId) {
        require(professorId > 0 && professorId <= professorCount, "Invalid professor ID");
        _;
    }

    modifier onlyValidCourseId(uint256 courseId) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        _;
    }

    modifier onlyStudentOrAdmin(uint256 studentId) {
        require(
            msg.sender == admin || msg.sender == students[studentId].studentAddress,
            "Not authorized"
        );
        _;
    }

    modifier onlyProfessor(uint256 courseId) {
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");
        require(msg.sender == courses[courseId].professor, "Only the course professor can perform this action");
        _;
    }

    // ------------------------------------------------
    //               CONTRACT CONSTRUCTOR
    // ------------------------------------------------
    constructor() {
        admin = msg.sender;
    }

    // ------------------------------------------------
    //               STUDENT FUNCTIONS
    // ------------------------------------------------
    function addStudent(
        string memory _name,
        uint8 _age,
        string memory _degree,
        address _studentAddress
    )
        public
        onlyAdmin
    {
        uint256 newId = ++studentCount;
        Student storage s = students[newId];
        s.id = newId;
        s.name = _name;
        s.age = _age;
        s.degree = _degree;
        s.studentAddress = _studentAddress;

        emit StudentAdded(newId, _name, _studentAddress);
    }

    /**
     * @notice Update an existing student's information.
     */
    function updateStudent(
        uint256 studentId,
        string memory newName,
        uint8 newAge,
        string memory newDegree
    )
        external
        onlyAdmin
        onlyValidStudentId(studentId)
    {
        Student storage s = students[studentId];
        s.name = newName;
        s.age = newAge;
        s.degree = newDegree;

        emit StudentInfoUpdated(studentId, newName, newAge, newDegree);
    }

    // ------------------------------------------------
    //             PROFESSOR FUNCTIONS
    // ------------------------------------------------
    function addProfessor(
        string memory _name,
        address _professorAddress
    )
        public
        onlyAdmin
    {
        uint256 newId = ++professorCount;
        Professor storage p = professors[newId];
        p.id = newId;
        p.name = _name;
        p.professorAddress = _professorAddress;

        emit ProfessorAdded(newId, _name, _professorAddress);
    }

    // ------------------------------------------------
    //               COURSE FUNCTIONS
    // ------------------------------------------------
    function createCourse(
        string memory _name,
        uint256 professorId
    )
        public
        onlyAdmin
        onlyValidProfessorId(professorId)
    {
        uint256 newCourseId = ++courseCount;
        address profAddr = professors[professorId].professorAddress;

        Course storage c = courses[newCourseId];
        c.id = newCourseId;
        c.name = _name;
        c.professor = profAddr;

        professors[professorId].teachingCourses.push(newCourseId);

        emit CourseCreated(newCourseId, _name, profAddr);
    }

    // ------------------------------------------------
    //       ENROLLMENT & GRADING FUNCTIONS
    // ------------------------------------------------
    function enrollStudent(
        uint256 studentId,
        uint256 courseId
    )
        public
        onlyValidStudentId(studentId)
        onlyValidCourseId(courseId)
        onlyStudentOrAdmin(studentId)
    {
        require(!isEnrolled[studentId][courseId], "Already enrolled");
        isEnrolled[studentId][courseId] = true;
        students[studentId].enrolledCourses.push(courseId);

        emit StudentEnrolled(studentId, courseId);
    }

    /**
     * @notice Allows student or admin to drop a course.
     */
    function dropCourse(
        uint256 studentId,
        uint256 courseId
    )
        external
        onlyValidStudentId(studentId)
        onlyValidCourseId(courseId)
        onlyStudentOrAdmin(studentId)
    {
        require(isEnrolled[studentId][courseId], "Not enrolled in this course");

        isEnrolled[studentId][courseId] = false;

        uint256[] storage coursesArray = students[studentId].enrolledCourses;
        for (uint256 i = 0; i < coursesArray.length; i++) {
            if (coursesArray[i] == courseId) {
                coursesArray[i] = coursesArray[coursesArray.length - 1];
                coursesArray.pop();
                break;
            }
        }
        emit StudentDroppedCourse(studentId, courseId);
    }

    /**
     * @notice Only the assigned professor can set a student's grade.
     */
    function assignGrade(
        uint256 courseId,
        address studentAddress,
        uint8 grade
    )
        public
        onlyProfessor(courseId)
    {
        require(grade <= 100, "Grade must be 0 to 100");
        courses[courseId].grades[studentAddress] = grade;
        emit GradeAssigned(courseId, studentAddress, grade);
    }

    // ------------------------------------------------
    //              VIEW / HELPER FUNCTIONS
    // ------------------------------------------------
    function getStudentCourses(uint256 studentId)
        public
        view
        onlyValidStudentId(studentId)
        returns (uint256[] memory)
    {
        return students[studentId].enrolledCourses;
    }

    function getProfessorCourses(uint256 professorId)
        public
        view
        onlyValidProfessorId(professorId)
        returns (uint256[] memory)
    {
        return professors[professorId].teachingCourses;
    }

    function getGrade(uint256 courseId, address studentAddress)
        public
        view
        onlyValidCourseId(courseId)
        returns (uint8)
    {
        return courses[courseId].grades[studentAddress];
    }

    function getCourseInfo(uint256 courseId)
        external
        view
        onlyValidCourseId(courseId)
        returns (
            uint256,
            string memory,
            address
        )
    {
        Course storage c = courses[courseId];
        return (c.id, c.name, c.professor);
    }
}
