
import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Inline,
  List,
  ListItem,
  Stack,
  Text,
} from '@forge/react';
import { view } from '@forge/bridge';
import { ValidationResult } from '../types/ValidationResult';
import { UserReference } from '../types/UserReference';
import { getCapabilityWorkItemByIssueKey, getCurrentUser, getSelfAssessmentData } from '../shared/capabilityDAO';
import frontendApiAdaptor from './frontendApiAdaptor';
import { SelfAssessmentData } from '../types/SelfAssessmentData';
import { CapabilityWorkItem } from '../types/CapabilityWorkItem';
import { CapabilityUtil } from '../shared/CapabilityUtil';
import { IssueReference } from '../types/IssueReference';

const CompletionPanel = () => {
  
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | undefined>(undefined);

  // const [usersWhoCanComplete, setUsersWhoCanComplete] = useState<UserReference[]>([]);
  // const [testCaseStats, setTestCaseStats] = useState<undefined |TestCaseStats>(undefined);

  const [capabilityWorkItem, setCapabilityWorkItem] = useState<undefined | CapabilityWorkItem>(undefined);
  const [currentUser, setCurrentUser] = useState<undefined | UserReference>(undefined);
  const [selfAssessmentData, setSelfAssessmentData] = useState<undefined | SelfAssessmentData>(undefined);

  const clearData = async () => {
    setLastUpdateTime(0);

    // setValidationResult(undefined);
    // setUsersWhoCanComplete([]);
    // setTestCaseStats(undefined);

    setCapabilityWorkItem(undefined);
    setCurrentUser(undefined);
    setSelfAssessmentData(undefined);
  }

  const retrieveData = async () => {
    const context = await view.getContext();
    const issueReference: IssueReference = {
      key: context.extension.issue.key
    }
    const capabilityUtil = new CapabilityUtil(frontendApiAdaptor);
    setLastUpdateTime(Date.now());
    const promises: Promise<any>[] = [
      capabilityUtil.allowIssueToBeResolved(issueReference, context.accountId).then(setValidationResult).then(),
      // invoke('getUsersWhoCanComplete').then(setUsersWhoCanComplete),
      // invoke('getTestCaseStats').then(setTestCaseStats),

      getCapabilityWorkItemByIssueKey(context.extension.issue.key).then(setCapabilityWorkItem),
      getCurrentUser(frontendApiAdaptor, context.accountId).then(setCurrentUser),
      getSelfAssessmentData(frontendApiAdaptor, context.extension.issue.key).then(setSelfAssessmentData),
    ];
    await Promise.all(promises);
  }

  useEffect(() => {
    retrieveData();
  }, []);

  const renderValidationResult = (validationResult: ValidationResult) => {
    if (validationResult.result) {
      return <Text>This feature is ready for you to transition it to completed.</Text>;
    } else {
      return <Text>This feature can't be completed yet. {validationResult.errorMessage}</Text>;
    }
  }

  const renderToolbar = () => {
    return (
      <ButtonGroup>
        <Button
          appearance="default"
          onClick={async () => {
            await clearData();
            await retrieveData();
          }}
        >
          Refresh
        </Button>
      </ButtonGroup>
    )
  }

  const renderValidationResultAndToolbar = (validationResult: ValidationResult) => {
    return (
      <Inline spread="space-between" space="space.200" alignBlock='center'>
        {renderValidationResult(validationResult)}
        {renderToolbar()}
      </Inline>
    )
  }

  const renderUsersWhoCanComplete = () => {
    if (capabilityWorkItem) {
      const usersWhoCanComplete: UserReference[] = [];
      const strategic_plan_owners = capabilityWorkItem.strategic_plan_owners; // e.g. "Business Lead: Derrick.Ives2@T-Mobile.com;Tech Lead: John.Dougherty7@T-Mobile.com;Tech Lead: Chandrika.Adhikesavalu1@T-Mobile.com;Tech Lead: Cameron.Brauer@T-Mobile.com;Tech Lead: Urel.Djiogan1@T-Mobile.com;Tech Lead: Akshay.Dhagat1@T-Mobile.com;Tech Lead: Alex.Nguyen33@T-Mobile.com"
      strategic_plan_owners.split(';').forEach(owner => {
        const [name, email] = owner.split(':').map(part => part.trim());
        usersWhoCanComplete.push({ name, email });
      });


      return (
        <Stack space="space.0">
          <Text weight="semibold">
            Authorized users
          </Text>
          <Text>
            Users who can complete this feature:
          </Text>
          <List type="unordered">
            {usersWhoCanComplete.map(user => (
              <ListItem key={user.email}>{user.name} ({user.email})</ListItem>
            ))}
          </List>
        </Stack>
      );
    } else {
      return <Text>No users can complete this feature.</Text>;
    }
  };

  const renderTestCaseStats = () => {
    if (!capabilityWorkItem) {
      return <Text>No test case stats available.</Text>;
    }
    return (
      <Stack space="space.025">
        <Text weight="semibold">
          Test case stats
        </Text>
        <Inline grow="fill" space="space.200">
          <Stack space="space.025">
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Pass
              </Text>
              <Badge appearance="added">{capabilityWorkItem.tests_passed}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Blocked
              </Text>
              <Badge appearance="important">{capabilityWorkItem.tests_blocked}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Deferred
              </Text>
              <Badge appearance="removed">{capabilityWorkItem.tests_deferred}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total N/A
              </Text>
              <Badge appearance="primary">{capabilityWorkItem.tests_not_applicable}</Badge>
            </Inline>
          </Stack>
          <Stack space="space.025">
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Failed
              </Text>
              <Badge appearance="important">{capabilityWorkItem.tests_failed}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total To Be Reviewed
              </Text>
              <Badge appearance="primary">{capabilityWorkItem.tests_to_be_reviewed}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Ready To Run
              </Text>
              <Badge appearance="primary">{capabilityWorkItem.tests_ready_to_run}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Others
              </Text>
              <Badge appearance="primary">{capabilityWorkItem.tests_other}</Badge>
            </Inline>
          </Stack>
          <Stack space="space.025">
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Dependent
              </Text>
              <Badge appearance="primary">{capabilityWorkItem.tests_dependent}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Incomplete
              </Text>
              <Badge appearance="primary">{capabilityWorkItem.tests_incomplete}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Unable to Test
              </Text>
              <Badge appearance="removed">{capabilityWorkItem.test_unable_to_test}</Badge>
            </Inline>
          </Stack>
        </Inline>
      </Stack>
    );
  }

  const computeBackgroundColor = (): any => {
    // https://atlassian.design/components/tokens/all-tokens#color-background
    if (validationResult) {
      if (validationResult.result) {
        return 'color.background.accent.lime.subtlest';
      } else {
        return 'color.background.accent.red.subtlest';
      }
    } else {
      return 'color.background.disabled';
    }
  }

  return (
    <Box backgroundColor={computeBackgroundColor()} padding="space.200">
      <Stack space="space.150">
        <Text>{validationResult ? renderValidationResultAndToolbar(validationResult) : 'Validating...'}</Text>
        {validationResult && !validationResult.result ? renderUsersWhoCanComplete() : null}
        {capabilityWorkItem ? renderTestCaseStats() : null}
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <CompletionPanel />
  </React.StrictMode>
);
