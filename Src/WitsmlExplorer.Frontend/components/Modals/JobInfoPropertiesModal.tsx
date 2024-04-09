import { TextField } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import JobStatus from "models/jobStatus";
import JobInfo from "models/jobs/jobInfo";
import React from "react";

export interface JobInfoPropertiesModalInterface {
  jobInfo: JobInfo;
}

const JobInfoPropertiesModal = (
  props: JobInfoPropertiesModalInterface
): React.ReactElement => {
  const { jobInfo } = props;
  const description = jobInfo.description.replaceAll("; ", ";\n");
  return (
    <>
      <ModalDialog
        heading={`Properties for ${jobInfo.jobType}`}
        content={
          <>
            <TextField
              readOnly
              id="id"
              label="Job ID"
              defaultValue={jobInfo.id}
            />
            <TextField
              readOnly
              id="jobType"
              label="Job Type"
              defaultValue={jobInfo.jobType}
            />
            <TextField
              readOnly
              id="status"
              label="Status"
              defaultValue={jobInfo.status}
            />
            {jobInfo.status == JobStatus.Failed && (
              <TextField
                readOnly
                multiline
                id="failedReason"
                label="Failure Reason"
                defaultValue={jobInfo.failedReason}
              />
            )}
            <TextField
              readOnly
              id="objectName"
              label="Object Name(s)"
              defaultValue={jobInfo.objectName}
            />
            <TextField
              readOnly
              id="wellboreName"
              label="Wellbore Name"
              defaultValue={jobInfo.wellboreName}
            />
            <TextField
              readOnly
              id="wellName"
              label="Well Name"
              defaultValue={jobInfo.wellName}
            />
            <TextField
              readOnly
              multiline
              rows={3}
              id="description"
              label="Description"
              defaultValue={description}
            />
            <TextField
              readOnly
              id="targetServer"
              label="Target Server Url"
              defaultValue={jobInfo.targetServer}
            />
            <TextField
              readOnly
              id="witsmlTargetUsername"
              label="Target Username"
              defaultValue={jobInfo.witsmlTargetUsername}
            />
            <TextField
              readOnly
              id="sourceServer"
              label="Source Server Url"
              defaultValue={
                jobInfo.sourceServer == "" ? "-" : jobInfo.sourceServer
              }
            />
            <TextField
              readOnly
              id="witsmlSourceUsername"
              label="Source Username"
              defaultValue={jobInfo.witsmlSourceUsername}
            />
            <TextField
              readOnly
              id="startTime"
              label="Start Time"
              defaultValue={
                jobInfo.startTime
                  ? new Date(jobInfo.startTime).toLocaleString()
                  : "-"
              }
            />
            <TextField
              readOnly
              id="finishTime"
              label="Finish Time"
              defaultValue={
                jobInfo.endTime
                  ? new Date(jobInfo.endTime).toLocaleString()
                  : "-"
              }
            />
            <TextField
              readOnly
              id="expirationTime"
              label="Expiration Time"
              defaultValue={
                jobInfo.killTime
                  ? new Date(jobInfo.killTime).toLocaleString()
                  : "-"
              }
            />
            <TextField
              readOnly
              id="username"
              label="Username"
              defaultValue={jobInfo.username}
            />
          </>
        }
        onSubmit={() => {
          return;
        }}
        confirmDisabled={true}
        isLoading={false}
        showConfirmButton={false}
      />
    </>
  );
};

export default JobInfoPropertiesModal;
