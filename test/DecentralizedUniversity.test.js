const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedUniversity Contract", function () {
    let university;
    let owner;
    let otherAccount;

    beforeEach(async function () {
        const University = await ethers.getContractFactory("DecentralizedUniversity");
        [owner, otherAccount] = await ethers.getSigners(); // Ensure owner and other accounts are initialized
        university = await University.deploy(); // Deploy the contract
        await university.waitForDeployment(); // Wait for deployment
    });

    it("Should set the admin correctly", async function () {
        expect(await university.admin()).to.equal(owner.address); // Use owner.address to check the admin
    });

    it("Should add a student", async function () {
        await university.addStudent("Alice", 21, "Engineering", owner.address);
        const student = await university.students(1);
        expect(student.name).to.equal("Alice");
        expect(student.age).to.equal(21);
        expect(student.degree).to.equal("Engineering");
    });

    it("Should add a professor", async function () {
        await university.addProfessor("Dr. Smith", owner.address);
        const professor = await university.professors(1);
        expect(professor.name).to.equal("Dr. Smith");
    });

    it("Should revert if a non-admin tries to add a student", async function () {
        const [_, nonAdmin] = await ethers.getSigners();
        await expect(
            university.connect(nonAdmin).addStudent("Bob", 22, "Math", nonAdmin.address)
        ).to.be.revertedWith("Only admin can perform this action");
    });
    
    it("Should revert if a non-admin tries to add a professor", async function () {
        const [_, nonAdmin] = await ethers.getSigners();
        await expect(
            university.connect(nonAdmin).addProfessor("Dr. Johnson", nonAdmin.address)
        ).to.be.revertedWith("Only admin can perform this action");
    });
    it("Should add multiple students and assign correct IDs", async function () {
        await university.addStudent("Alice", 21, "Engineering", owner.address);
        await university.addStudent("Bob", 22, "Mathematics", owner.address);
        const student1 = await university.students(1);
        const student2 = await university.students(2);
    
        expect(student1.name).to.equal("Alice");
        expect(student2.name).to.equal("Bob");
        expect(student1.id).to.equal(1);
        expect(student2.id).to.equal(2);
    });
    it("Should add multiple professors and assign correct IDs", async function () {
        await university.addProfessor("Dr. Smith", owner.address);
        await university.addProfessor("Dr. Johnson", owner.address);
        const professor1 = await university.professors(1);
        const professor2 = await university.professors(2);
    
        expect(professor1.name).to.equal("Dr. Smith");
        expect(professor2.name).to.equal("Dr. Johnson");
        expect(professor1.id).to.equal(1);
        expect(professor2.id).to.equal(2);
    });
    it("Should create a course and assign it to a professor", async function () {
        await university.addProfessor("Dr. Smith", owner.address);
        await university.createCourse("Blockchain 101", 1);
        const course = await university.courses(1);
    
        expect(course.name).to.equal("Blockchain 101");
        expect(course.professor).to.equal(owner.address);
    });
    it("Should revert if a non-admin tries to create a course", async function () {
        const [_, nonAdmin] = await ethers.getSigners();
        await university.addProfessor("Dr. Smith", owner.address);
    
        await expect(
            university.connect(nonAdmin).createCourse("Blockchain 101", 1)
        ).to.be.revertedWith("Only admin can perform this action");
    });
    it("Should enroll a student in a course", async function () {
        await university.addStudent("Alice", 21, "Engineering", owner.address);
        await university.addProfessor("Dr. Smith", owner.address);
        await university.createCourse("Blockchain 101", 1);
    
        await university.enrollStudent(1, 1);
        const isEnrolled = await university.isEnrolled(1, 1);
    
        expect(isEnrolled).to.be.true;
    });
    it("Should revert if a student tries to enroll in the same course twice", async function () {
        await university.addStudent("Alice", 21, "Engineering", owner.address);
        await university.addProfessor("Dr. Smith", owner.address);
        await university.createCourse("Blockchain 101", 1);
    
        await university.enrollStudent(1, 1);
        await expect(university.enrollStudent(1, 1)).to.be.revertedWith("Already enrolled");
    });
    it("Should allow a professor to assign a grade to a student", async function () {
        await university.addStudent("Alice", 21, "Engineering", owner.address);
        await university.addProfessor("Dr. Smith", owner.address);
        await university.createCourse("Blockchain 101", 1);
    
        await university.enrollStudent(1, 1);
        await university.assignGrade(1, owner.address, 85);
    
        const grade = await university.getGrade(1, owner.address);
        expect(grade).to.equal(85);
    });
    it("Should revert if a non-professor tries to assign a grade", async function () {
        const [_, nonProfessor] = await ethers.getSigners();
    
        await university.addStudent("Alice", 21, "Engineering", owner.address);
        await university.addProfessor("Dr. Smith", owner.address);
        await university.createCourse("Blockchain 101", 1);
        await university.enrollStudent(1, 1);
    
        await expect(
            university.connect(nonProfessor).assignGrade(1, owner.address, 85)
        ).to.be.revertedWith("Only the course professor can perform this action");
    });
    it("Should revert if an invalid student ID is used", async function () {
        await expect(university.enrollStudent(999, 1)).to.be.revertedWith("Invalid student ID");
    });
    
    it("Should revert if an invalid course ID is used", async function () {
        await university.addStudent("Alice", 21, "Engineering", owner.address);
        await expect(university.enrollStudent(1, 999)).to.be.revertedWith("Invalid course ID");
    });
    
    it("Should revert if admin (not a professor) tries to assign a grade", async function () {
        // Add a student
        await university.addStudent("Alice", 21, "Engineering", owner.address);
    
        // Add a professor with a different address
        await university.addProfessor("Dr. Smith", otherAccount.address);
    
        // Create a course assigned to the professor
        await university.createCourse("Blockchain 101", 1);
    
        // Enroll the student in the course
        await university.enrollStudent(1, 1);
    
        // Attempt to assign a grade as the admin (owner)
        await expect(
            university.assignGrade(1, owner.address, 90) // Admin trying to assign grade
        ).to.be.revertedWith("Only the course professor can perform this action");
    });
    
                                            


});
