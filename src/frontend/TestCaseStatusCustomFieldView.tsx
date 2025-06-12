import React, { useState, useEffect } from 'react';
import ForgeReconciler, { Text, Stack } from "@forge/react";
import { view } from '@forge/bridge';
import { CapabilityWorkItem } from '../types/CapabilityWorkItem';
import { getCapabilityWorkItemByIssueKey } from '../shared/capabilityDAO';
import frontendApiAdaptor from './frontendApiAdaptor';

const CustomFieldView = () => {

  const [dataQueried, setDataQueried] = useState<boolean>(false);
  const [capabilityWorkItem, setCapabilityWorkItem] = useState<CapabilityWorkItem | undefined>(undefined);

  const onMount = async (): Promise<void> => {
    const viewContext = await view.getContext();
    // console.log(`CustomFieldView.onMount: viewContext = ${JSON.stringify(viewContext, null, 2)}`);

    // Typically the value of a custom field would be retrieved from the custom field context as follows:
    //   const value = viewContext.extension.fieldValue
    // However, we are getting our value from an entity property.
    const capabilityWorkItem = await getCapabilityWorkItemByIssueKey(viewContext.extension.issue.key);
    setCapabilityWorkItem(capabilityWorkItem);
    setDataQueried(true);
  }

  useEffect(() => {
    onMount();
  }, []);

  const renderTestCaseInfo = () => {
    if (capabilityWorkItem && capabilityWorkItem.tests_passed !== undefined) {
      const testCaseMessage = `Test case pass count: ${capabilityWorkItem.tests_passed}`;
      return (
        <Stack>
          <Text>{testCaseMessage}</Text>
        </Stack>
      );
    } else if (dataQueried) {
      return <Text>No test case data found</Text>
    } else {
      return <Text>Loading...</Text>
    }
  }
  return renderTestCaseInfo();
};

ForgeReconciler.render(
  <React.StrictMode>
    <CustomFieldView />
  </React.StrictMode>
);
