# Forge Workflow Validator Demo

This project contains a Forge app written in Javascript that validates a Jira workflow. 

To get started with Forge, visit [this guide](https://developer.atlassian.com/platform/forge/getting-started/).

## Scenario

A team uses the Features (FEAT) project to manage the workflow relating to the delivery of features. Each feature must have at least one related test case represented by work items in the Feature Tests (TF) project. The app must prevent FEAT transitions from In Progress to Resolved if the current user is not authorized or if there are linked test cases that have not passed.

## Configuration and assumptions

* Features project key: FEAT
* Feature Tests (test cases) project key: FT
* The FEAT statuses are `Incomplete`, `In Progress` and `Resolved`.
* The FT statuses are `Pass`, `Fail`, `Blocked`, `Deferred`, `To Be Reviewed`, `Ready To Run`, `Dependent` and `Incomplete`.
* The allowed users that can resolve feature issues is hard coded in [authorizationUtil.ts](https://github.com/dugaldmorrow/forge-workflow-validator/blob/main/src/authorizationUtil.ts#L29), but this could conceivably retrieve users from an external source.

A demo site has been set up at https://workflow-enforcer-demo.atlassian.net/ - request access if necessary. Here are some handy links within the site:

* [Features (FEAT) project](https://workflow-enforcer-demo.atlassian.net/jira/software/c/projects/FEAT/boards/2)
* [Feature Tests (FT) project](https://workflow-enforcer-demo.atlassian.net/jira/software/c/projects/FT/boards/34)
* [Features workflow](https://workflow-enforcer-demo.atlassian.net/secure/admin/workflows/WorkflowDesigner.jspa?workflowMode=draft&wfName=Demo%20Workflow&project=10000)
* [Feature Tests workflow](https://workflow-enforcer-demo.atlassian.net/secure/admin/workflows/WorkflowDesigner.jspa?wfName=Test%20Case%20Workflow&workflowMode=live)


### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
