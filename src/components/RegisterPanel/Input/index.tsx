import React, { forwardRef } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import IssueInput from '../../IssueInputPanel'


export const Input = forwardRef((props: any, ref: any)  : JSX.Element=> {
  return (
    <IssueInput
      variant="outlined"
      margin="normal"
      inputRef={ref}
      fullWidth
      {...props}
    />
  );
});