import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Drawer
} from 'material-ui';
import {
  AccountCircle, ChevronLeft, ChevronRight,
  Menu as MenuIcon
} from '@material-ui/icons';
import Menu, { MenuItem } from 'material-ui/Menu';
import { Link } from 'react-router-dom';
import { setCurrentUserByToken } from '../../../actions/signin';

import DrawerList from './drawerList';
import SiteList from './siteList';

import { drawerStyle } from '../../../assets/jss/styles';

const styles = theme => ({
  ...drawerStyle(theme),

  flex: {
    flex: 1,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
});

class Header extends React.Component {
  state = { anchorEl: null };

  static getDerivedStateFromProps(nextProps, prevState) {
    prevState.drawerOpen = nextProps.drawerOpen;
    return prevState;
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };
  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleDrawerOpen = () => {
    this.props.onDrawerToggle(true);
  };
  handleDrawerClose = () => {
    this.props.onDrawerToggle(false);
  };

  signout = () => {
    const { domain } = this.props.info;

    this.handleClose();
    localStorage.removeItem(`jwtToken/${domain}`);
    this.props.setCurrentUserByToken(domain, false);
  }

  render() {
    const { classes, site, theme,
      info: { domain },
      auth: { isAuthenticated }
    } = this.props;
    const { anchorEl, drawerOpen } = this.state;
    const anchorOpen = Boolean(anchorEl);

    return (
      <div>
        <AppBar
          className={classNames(classes.appBar, drawerOpen && classes.appBarShift)}
        >
          <Toolbar>
            {isAuthenticated ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, drawerOpen && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
            ) : null}
            <Typography variant="title" color="inherit" noWrap className={classes.flex}
              component={Link} to={`/${domain}`}
            >
              {site.title}
            </Typography>
            {isAuthenticated ? (
              <div>
                <IconButton
                  aria-owns={anchorOpen ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={anchorOpen}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.signout}>Sign out</MenuItem>
                </Menu>
              </div>
            ) : (
              <Button color="inherit"
                component={Link} to={`${domain ? '/' : ''}${domain}/signin`}
              >Sign in / Sign up</Button>
            )}
          </Toolbar>
        </AppBar>
        {isAuthenticated ? (
          <Drawer
            variant="permanent"
            classes={{
              paper: classNames(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
            }}
            open={drawerOpen}
          >
            <div className={classes.toolbar}>
              <IconButton onClick={this.handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </div>
            <DrawerList />
            <SiteList />
          </Drawer>
        ) : null}
      </div>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

function mapStateToProps({ info, sites, auth }) {
  return {
    info, auth,
    site: sites[info.domain]
  };
}

export default connect(mapStateToProps, { setCurrentUserByToken })(
  withStyles(styles, { withTheme: true })(Header)
);
