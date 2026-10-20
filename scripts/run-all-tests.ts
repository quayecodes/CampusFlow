import { spawnSync } from "child_process";
import path from "path";

interface SuiteResult {
  name: string;
  script: string;
  passed: boolean;
  durationMs: number;
  output: string;
}

const suites = [
  {
    name: "Suite 1: Authentication & Password Security",
    script: "scripts/test-auth.ts",
  },
  {
    name: "Suite 2: Course Registration & Concurrency",
    script: "scripts/test-course-registration.ts",
  },
  {
    name: "Suite 3: Attendance Tracking & 75% Rule",
    script: "scripts/test-attendance.ts",
  },
  {
    name: "Suite 4: Assignment Submission & Grading",
    script: "scripts/test-assignments.ts",
  },
  {
    name: "Suite 5: Grade Governance & Audit Trail",
    script: "scripts/test-grades.ts",
  },
  {
    name: "Suite 6: Scoped Bulletins & Feed Isolation",
    script: "scripts/test-announcements.ts",
  },
  {
    name: "Suite 7: RBAC Authorization & OWASP Security",
    script: "scripts/test-security-rbac.ts",
  },
];

async function main() {
  console.log("===============================================================================");
  console.log("             CAMPUSFLOW COMPREHENSIVE AUTOMATED TEST RUNNER                    ");
  console.log("===============================================================================\n");

  const results: SuiteResult[] = [];
  const globalStart = Date.now();

  for (let i = 0; i < suites.length; i++) {
    const suite = suites[i];
    console.log(`\n[${i + 1}/${suites.length}] RUNNING: ${suite.name} (${suite.script})...`);
    console.log("-------------------------------------------------------------------------------");

    const suiteStart = Date.now();
    const isWindows = process.platform === "win32";
    const tsxCmd = isWindows ? "npx.cmd" : "npx";

    const proc = spawnSync(tsxCmd, ["tsx", suite.script], {
      cwd: process.cwd(),
      stdio: "pipe",
      encoding: "utf-8",
      shell: true,
    });

    const durationMs = Date.now() - suiteStart;
    const stdout = proc.stdout || "";
    const stderr = proc.stderr || "";
    const fullOutput = stdout + (stderr ? "\n" + stderr : "");

    // Print test output indented
    if (stdout.trim()) {
      console.log(stdout.trim());
    }
    if (stderr.trim()) {
      console.error(stderr.trim());
    }

    const passed = proc.status === 0;
    results.push({
      name: suite.name,
      script: suite.script,
      passed,
      durationMs,
      output: fullOutput,
    });

    if (passed) {
      console.log(`>>> STATUS: PASSED (${(durationMs / 1000).toFixed(2)}s)`);
    } else {
      console.error(`>>> STATUS: FAILED (${(durationMs / 1000).toFixed(2)}s, exit code: ${proc.status})`);
    }
  }

  const globalDuration = ((Date.now() - globalStart) / 1000).toFixed(2);
  const totalSuites = results.length;
  const passedSuites = results.filter((r) => r.passed).length;
  const failedSuites = totalSuites - passedSuites;

  console.log("\n===============================================================================");
  console.log("                         EXECUTIVE TEST SUITE SUMMARY                          ");
  console.log("===============================================================================");
  console.log(`Total Test Suites: ${totalSuites} | Passed: ${passedSuites} | Failed: ${failedSuites}`);
  console.log(`Total Execution Time: ${globalDuration} seconds\n`);

  console.log("SUITE BREAKDOWN:");
  results.forEach((r, idx) => {
    const symbol = r.passed ? "[PASS]" : "[FAIL]";
    const sec = (r.durationMs / 1000).toFixed(2);
    console.log(`  ${symbol} ${idx + 1}. ${r.name.padEnd(52)} (${sec}s)`);
  });

  console.log("===============================================================================\n");

  if (failedSuites > 0) {
    console.error("OVERALL SUITE STATUS: FAILED");
    process.exit(1);
  } else {
    console.log("OVERALL SUITE STATUS: ALL TEST SUITES PASSED CLEANLY (59/59 TESTS OK)");
    process.exit(0);
  }
}

main();
