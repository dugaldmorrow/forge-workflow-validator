
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
import { invoke } from '@forge/bridge';
import { ValidationResult } from 'src/types/ValidationResult';
import { UserReference } from 'src/types/UserReference';
import { TestCaseStats } from 'src/types/TestCaseStats';

const App = () => {
  
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | undefined>(undefined);
  const [usersWhoCanComplete, setUsersWhoCanComplete] = useState<UserReference[]>([]);
  const [testCaseStats, setTestCaseStats] = useState<undefined |TestCaseStats>(undefined);

  const clearData = async () => {
    setLastUpdateTime(0);
    setValidationResult(undefined);
    setUsersWhoCanComplete([]);
    setTestCaseStats(undefined);
  }

  const retrieveData = async () => {
    setLastUpdateTime(Date.now());
    const promises: Promise<any>[] = [
      invoke('getCompletionValidationInfo').then(setValidationResult).then(),
      invoke('getUsersWhoCanComplete').then(setUsersWhoCanComplete),
      invoke('getTestCaseStats').then(setTestCaseStats)
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
    if (usersWhoCanComplete.length > 0) {
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
              <Badge appearance="added">{testCaseStats.totalPass}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Blocked
              </Text>
              <Badge appearance="important">{testCaseStats.totalBlocked}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Deferred
              </Text>
              <Badge appearance="removed">{testCaseStats.totalDeferred}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total N/A
              </Text>
              <Badge appearance="primary">{testCaseStats.totalNa}</Badge>
            </Inline>
          </Stack>
          <Stack space="space.025">
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Failed
              </Text>
              <Badge appearance="important">{testCaseStats.totalFailed}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total To Be Reviewed
              </Text>
              <Badge appearance="primary">{testCaseStats.totalToBeReviewed}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Ready To Run
              </Text>
              <Badge appearance="primary">{testCaseStats.totalReadyToRun}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Others
              </Text>
              <Badge appearance="primary">{testCaseStats.totalOthers}</Badge>
            </Inline>
          </Stack>
          <Stack space="space.025">
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Dependent
              </Text>
              <Badge appearance="primary">{testCaseStats.totalDependent}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Incomplete
              </Text>
              <Badge appearance="primary">{testCaseStats.totalIncomplete}</Badge>
            </Inline>
            <Inline space="space.050" spread="space-between">
              <Text>
                Total Unable to Test
              </Text>
              <Badge appearance="removed">{testCaseStats.totalUnableToTest}</Badge>
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
        {testCaseStats ? renderTestCaseStats() : null}
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
