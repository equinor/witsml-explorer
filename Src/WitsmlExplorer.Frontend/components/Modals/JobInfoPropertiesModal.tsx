import { TextField } from "@material-ui/core";
import React from "react";
import JobInfo from "../../models/jobs/jobInfo";
import ModalDialog from "./ModalDialog";

export interface JobInfoPropertiesModalInterface {
  jobInfo: JobInfo;
}

const JobInfoPropertiesModal = (props: JobInfoPropertiesModalInterface): React.ReactElement => {
  const { jobInfo } = props;
  const description = jobInfo.description.replaceAll("; ", ";\n");
  return (
    <>
      <ModalDialog
        heading={`Properties for ${jobInfo.jobType}`}
        content={
          <>
            <TextField InputProps={{ readOnly: true }} id="id" label="Job ID" defaultValue={jobInfo.id} fullWidth />
            <TextField InputProps={{ readOnly: true }} id="jobType" label="Job Type" defaultValue={jobInfo.jobType} fullWidth />
            <TextField InputProps={{ readOnly: true }} id="status" label="Status" defaultValue={jobInfo.status} fullWidth />
            {jobInfo.status == "Failed" && (
              <TextField InputProps={{ readOnly: true }} multiline id="failedReason" label="Failure Reason" defaultValue={jobInfo.failedReason} fullWidth />
            )}
            <TextField InputProps={{ readOnly: true }} multiline id="description" label="Description" defaultValue={description.substring(0, description.length - 1)} fullWidth />
            <TextField InputProps={{ readOnly: true }} id="targetServer" label="Target Server Url" defaultValue={jobInfo.targetServer} fullWidth />
            <TextField
              InputProps={{ readOnly: true }}
              id="sourceServer"
              label="Source Server Url"
              defaultValue={jobInfo.sourceServer == "" ? "-" : jobInfo.sourceServer}
              fullWidth
            />
            <TextField
              InputProps={{ readOnly: true }}
              id="startTime"
              label="Start Time"
              defaultValue={jobInfo.startTime ? new Date(jobInfo.startTime).toLocaleString() : "-"}
              fullWidth
            />
            <TextField
              InputProps={{ readOnly: true }}
              id="finishTime"
              label="Finish Time"
              defaultValue={jobInfo.endTime ? new Date(jobInfo.endTime).toLocaleString() : "-"}
              fullWidth
            />
            <TextField
              InputProps={{ readOnly: true }}
              id="expirationTime"
              label="Expiration Time"
              defaultValue={jobInfo.killTime ? new Date(jobInfo.killTime).toLocaleString() : "-"}
              fullWidth
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
