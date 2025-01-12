import CONTRACT_ABI from './abi.js'; // import your ABI

const CONTRACT_ADDRESS = "0x0F2866115d6b3C7b623469A99A7b34D142dA505b"; 
let web3;
let contract;
let userAccount;

// MetaMask Connection Functionality
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      document.getElementById('walletAddress').textContent = `Wallet: ${userAccount}`;

      // Show admin forms
      document.getElementById('functions').style.display = 'block';
      // Show other forms (enroll, drop, etc.)
      document.getElementById('otherFunctions').style.display = 'block';

      initializeContract(); // Initialize contract after wallet connection
    } catch (error) {
      console.error('User denied account access:', error);
      alert('Please allow MetaMask connection.');
    }
  } else {
    alert('MetaMask is not detected. Please install it to use this application.');
  }
}

// Initialize Smart Contract
async function initializeContract() {
  try {
    web3 = new Web3(window.ethereum); 
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS); 
    console.log('Smart contract initialized:', contract);


  } catch (error) {
    console.error('Failed to initialize contract:', error);
  }
}

// -------------------- Admin Functions --------------------

// 1. Add Student
async function addStudent() {
  const name = document.getElementById('studentName').value.trim();
  const age = parseInt(document.getElementById('studentAge').value);
  const degree = document.getElementById('studentDegree').value.trim();

  if (!name || !degree || isNaN(age) || age <= 0) {
    alert('Please provide valid student details.');
    return;
  }

  try {
    await contract.methods.addStudent(name, age, degree, userAccount).send({ from: userAccount });
    alert(`Student "${name}" added successfully!`);
  } catch (error) {
    console.error('Error adding student:', error);
    alert('Failed to add student. Check console for details.');
  }
}

// 2. Add Professor
async function addProfessor() {
  const name = document.getElementById('professorName').value.trim();
  if (!name) {
    alert('Please provide a valid professor name.');
    return;
  }

  try {
    await contract.methods.addProfessor(name, userAccount).send({ from: userAccount });
    alert(`Professor "${name}" added successfully!`);
  } catch (error) {
    console.error('Error adding professor:', error);
    alert('Failed to add professor. Check console for details.');
  }
}

// 3. Create Course
async function createCourse() {
  const name = document.getElementById('courseName').value.trim();
  const professorId = parseInt(document.getElementById('courseProfessorId').value);

  if (!name || isNaN(professorId) || professorId <= 0) {
    alert('Please provide valid course details.');
    return;
  }

  try {
    await contract.methods.createCourse(name, professorId).send({ from: userAccount });
    alert(`Course "${name}" created successfully!`);
  } catch (error) {
    console.error('Error creating course:', error);
    alert('Failed to create course. Check console for details.');
  }
}

// 4. Update Student
async function updateStudent() {
  const studentId = parseInt(document.getElementById('updateStudentId').value);
  const newName = document.getElementById('updateStudentName').value.trim();
  const newAge = parseInt(document.getElementById('updateStudentAge').value);
  const newDegree = document.getElementById('updateStudentDegree').value.trim();

  if (isNaN(studentId) || studentId <= 0 || !newName || !newDegree || isNaN(newAge) || newAge <= 0) {
    alert('Please provide valid data for updating the student.');
    return;
  }

  try {
    await contract.methods.updateStudent(studentId, newName, newAge, newDegree).send({ from: userAccount });
    alert(`Student #${studentId} updated successfully!`);
  } catch (error) {
    console.error('Error updating student:', error);
    alert('Failed to update student. Check console for details.');
  }
}

// -------------------- Other Functions --------------------

// Enroll Student
async function enrollStudent() {
  const studentId = parseInt(document.getElementById('enrollStudentId').value);
  const courseId = parseInt(document.getElementById('enrollCourseId').value);

  if (isNaN(studentId) || studentId <= 0 || isNaN(courseId) || courseId <= 0) {
    alert('Please enter valid student ID and course ID.');
    return;
  }

  try {
    await contract.methods.enrollStudent(studentId, courseId).send({ from: userAccount });
    alert(`Enrolled student #${studentId} into course #${courseId}.`);
  } catch (error) {
    console.error('Error enrolling student:', error);
    alert('Failed to enroll. Check console for details.');
  }
}

// Drop Course
async function dropCourse() {
  const studentId = parseInt(document.getElementById('dropStudentId').value);
  const courseId = parseInt(document.getElementById('dropCourseId').value);

  if (isNaN(studentId) || studentId <= 0 || isNaN(courseId) || courseId <= 0) {
    alert('Please enter valid student ID and course ID.');
    return;
  }

  try {
    await contract.methods.dropCourse(studentId, courseId).send({ from: userAccount });
    alert(`Dropped course #${courseId} for student #${studentId}.`);
  } catch (error) {
    console.error('Error dropping course:', error);
    alert('Failed to drop course. Check console for details.');
  }
}

// Assign Grade (Professor Only)
async function assignGrade() {
  const courseId = parseInt(document.getElementById('assignCourseId').value);
  const studentAddress = document.getElementById('assignStudentAddress').value.trim();
  const grade = parseInt(document.getElementById('assignGradeValue').value);

  if (isNaN(courseId) || courseId <= 0 || !studentAddress || isNaN(grade) || grade < 0 || grade > 100) {
    alert('Please provide valid inputs for assigning a grade (0-100).');
    return;
  }

  try {
    await contract.methods.assignGrade(courseId, studentAddress, grade).send({ from: userAccount });
    alert(`Assigned grade ${grade} to ${studentAddress} for course #${courseId}.`);
  } catch (error) {
    console.error('Error assigning grade:', error);
    alert('Failed to assign grade. Check console for details.');
  }
}

// getGrade
async function getGrade() {
  const courseId = parseInt(document.getElementById('getGradeCourseId').value);
  const studentAddress = document.getElementById('getGradeStudentAddress').value.trim();

  if (isNaN(courseId) || courseId <= 0 || !studentAddress) {
    alert('Please provide valid course ID and student address.');
    return;
  }

  try {
    const grade = await contract.methods.getGrade(courseId, studentAddress).call();
    document.getElementById('showGrade').textContent =
      `Student ${studentAddress} has grade: ${grade} in course #${courseId}`;
  } catch (error) {
    console.error('Error getting grade:', error);
    alert('Failed to get grade. Check console for details.');
  }
}

// ----------------------------------------------------------
// Event Listeners
// ----------------------------------------------------------
function setupEventListeners() {
  document.getElementById('connectWallet').addEventListener('click', connectWallet);

  // Admin
  document.getElementById('addStudent').addEventListener('click', addStudent);
  document.getElementById('addProfessor').addEventListener('click', addProfessor);
  document.getElementById('createCourse').addEventListener('click', createCourse);
  document.getElementById('updateStudent').addEventListener('click', updateStudent);

  // Other
  document.getElementById('enrollStudentBtn').addEventListener('click', enrollStudent);
  document.getElementById('dropCourseBtn').addEventListener('click', dropCourse);
  document.getElementById('assignGradeBtn').addEventListener('click', assignGrade);
  document.getElementById('getGradeBtn').addEventListener('click', getGrade);
}

window.onload = setupEventListeners;


