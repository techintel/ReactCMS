import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, Menu, MenuItem } from '@material-ui/core';
import { AccountCircle,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { slashDomain } from '../../../utils';
import { setCurrentUserByToken } from '../../../actions/signin';

import DrawerList from './DrawerList';
import SiteList from './SiteList';
import Search from './Search';

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

    this.handleDrawerClose();
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
          id="header"
        >
          <Toolbar>
            {isAuthenticated && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, drawerOpen && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" color="inherit" noWrap className={classes.flex}
              component={Link} to={`/${domain}`}
            >
              {site.title}
            </Typography>

            <Search />

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
                component={Link} to={`${slashDomain(domain)}/signin`}
              >Sign in / Sign up</Button>
            )}
          </Toolbar>
        </AppBar>
        {isAuthenticated && (
          <Drawer
            variant="permanent"
            classes={{
              paper: classNames(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
            }}
            open={drawerOpen}
          >
            <div className={classes.toolbar}>
              <IconButton onClick={this.handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </div>
            <DrawerList />
            <SiteList />
          </Drawer>
        )}
      </div>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  drawerOpen: PropTypes.bool,
  onDrawerToggle: PropTypes.func.isRequired,
  info: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
  setCurrentUserByToken: PropTypes.func.isRequired,
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
