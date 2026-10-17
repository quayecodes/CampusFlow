import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CampusFlow foundational data...\n");

  const defaultPasswordHash = await bcrypt.hash("CampusFlow2026!", 12);

  // 1. Department
  const csDept = await prisma.department.upsert({
    where: { id: "dept-cs-001" },
    update: {},
    create: {
      id: "dept-cs-001",
      name: "Department of Computer Science",
    },
  });
  console.log("Department created:", csDept.name);

  // 2. Program
  const bscProgram = await prisma.program.upsert({
    where: { id: "prog-cs-001" },
    update: {},
    create: {
      id: "prog-cs-001",
      name: "BSc Computer Science",
      departmentId: csDept.id,
    },
  });
  console.log("Program created:", bscProgram.name);

  // 3. University Admin
  const uniAdmin = await prisma.user.upsert({
    where: { email: "admin@campusflow.edu" },
    update: {},
    create: {
      email: "admin@campusflow.edu",
      fullName: "Prof. Arthur Pendelton",
      passwordHash: defaultPasswordHash,
      role: Role.UNI_ADMIN,
    },
  });
  console.log("University Admin created:", uniAdmin.email);

  // 4. Department Admin
  const deptAdmin = await prisma.user.upsert({
    where: { email: "dept.admin@campusflow.edu" },
    update: {},
    create: {
      email: "dept.admin@campusflow.edu",
      fullName: "Dr. Eleanor Vance",
      passwordHash: defaultPasswordHash,
      role: Role.DEPT_ADMIN,
      departmentId: csDept.id,
    },
  });
  console.log("Department Admin created:", deptAdmin.email);

  // 5. Lecturer
  const lecturer = await prisma.user.upsert({
    where: { email: "dr.mensah@campusflow.edu" },
    update: {},
    create: {
      email: "dr.mensah@campusflow.edu",
      fullName: "Dr. Kweku Mensah",
      passwordHash: defaultPasswordHash,
      role: Role.LECTURER,
      departmentId: csDept.id,
    },
  });
  console.log("Lecturer created:", lecturer.email);

  // 6. Test Students
  const student1 = await prisma.user.upsert({
    where: { email: "student1@campusflow.edu" },
    update: {},
    create: {
      email: "student1@campusflow.edu",
      fullName: "Kwame Asante",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      departmentId: csDept.id,
      programId: bscProgram.id,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@campusflow.edu" },
    update: {},
    create: {
      email: "student2@campusflow.edu",
      fullName: "Ama Boateng",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      departmentId: csDept.id,
      programId: bscProgram.id,
    },
  });
  console.log("Test Students created:", student1.email, student2.email);

  // 7. Courses
  const course1 = await prisma.course.upsert({
    where: { id: "course-cs201" },
    update: {},
    create: {
      id: "course-cs201",
      title: "CS201: Data Structures and Algorithms",
      creditHours: 3,
      maxCapacity: 30,
      semester: "2026-Fall",
      departmentId: csDept.id,
      lecturerId: lecturer.id,
    },
  });

  // Course with very small capacity (2 seats) to verify race-condition and capacity rejection
  const course2 = await prisma.course.upsert({
    where: { id: "course-cs202" },
    update: {},
    create: {
      id: "course-cs202",
      title: "CS202: Database Management Systems",
      creditHours: 3,
      maxCapacity: 2,
      semester: "2026-Fall",
      departmentId: csDept.id,
      lecturerId: lecturer.id,
    },
  });

  console.log("Courses created:", course1.title, course2.title);
  console.log("\nFoundational seed data complete! All test accounts use password: CampusFlow2026!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
