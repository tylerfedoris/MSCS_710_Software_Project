import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { useTheme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import DashboardIcon from "@material-ui/icons/Dashboard";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";
import React from "react";
import { useStyles } from "themes/DynamicDrawerTheme";
import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Grid } from "@material-ui/core";

interface Props {
  children: any;
  username: string;
  signoutButton: any;
  onSelect?: (pageName: string) => void;
}

export default function Navigation({
  children,
  onSelect,
  username,
  signoutButton,
}: Props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
    name: string
  ) => {
    setSelectedIndex(index);

    if (onSelect) {
      onSelect(name);
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            id="open-drawer"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" noWrap style={{ fontWeight: "bold" }}>
            Windows Analysis Reporting
          </Typography>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              marginRight: 50,
            }}
          >
            <Grid
              container
              spacing={3}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={6}>
                <Typography variant="h5" noWrap>
                  {username}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {signoutButton}
              </Grid>
            </Grid>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        id="drawer"
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton id="close-drawer" onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List component="nav">
          {["Account", "Dashboard"].map((text, index) => (
            <ListItem
              button
              key={text}
              selected={selectedIndex === index}
              onClick={(event) => handleListItemClick(event, index, text)}
            >
              <ListItemIcon>
                {
                  {
                    Dashboard: <DashboardIcon />,
                    Account: <AccountBoxIcon />,
                  }[text]
                }
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {children}
      </main>
    </>
  );
}
