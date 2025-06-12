
export type CapabilityWorkItem = {
  cap_id: string; // This is the capability ID. e.g. "3161254"
  cap_key: string; // This is the issue key. e.g. "CAP-12859"
  cap_status: string; // e.g. "To Do"
  ini_strategic_plan: string; // e.g. "Satellite Connectivity"
  strategic_plan_owners: string; // e.g. "Business Lead: Derrick.Ives2@T-Mobile.com;Tech Lead: John.Dougherty7@T-Mobile.com;Tech Lead: Chandrika.Adhikesavalu1@T-Mobile.com;Tech Lead: Cameron.Brauer@T-Mobile.com;Tech Lead: Urel.Djiogan1@T-Mobile.com;Tech Lead: Akshay.Dhagat1@T-Mobile.com;Tech Lead: Alex.Nguyen33@T-Mobile.com"
  feat_count: number; // e.g. 0
  feat_capex: number; // e.g. 0
  feat_opex: number; // e.g. 0
  feat_no_tow: number; // e.g. 0
  feat_unresolved: number; // e.g. 0
  feat_canceled: number; // e.g. 0
  test_count: number; // e.g. 0
  tests_passed: number; // e.g. 0
  tests_failed: number; // e.g. 0
  tests_blocked: number; // e.g. 0
  tests_deferred: number; // e.g. 0
  tests_ready_to_run: number; // e.g. 0
  tests_incomplete: number; // e.g. 0
  tests_unexecuted: number; // e.g. 0
  tests_to_be_reviewed: number; // e.g. 0
  tests_dependent: number; // e.g. 0
  tests_not_applicable: number; // e.g. 0
  test_unable_to_test: number; // e.g. 0
  tests_other: number; // e.g. 0
}
