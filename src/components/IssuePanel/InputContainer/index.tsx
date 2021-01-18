import React, { ElementType, ReactElement } from "react";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export const MainContainer = ({ children}: {children:JSX.Element }) : JSX.Element  => {
  const styles = useStyles();

  return (
    <Container
      className={styles.root}
      component="main"
      maxWidth="xs"
    >
      {children}
    </Container>
  );
};