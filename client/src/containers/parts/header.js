import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { AppBar, Toolbar, Typography, Button, IconButton } from 'material-ui';
import { Menu as MenuIcon, AccountCircle } from 'material-ui-icons';
import Menu, { MenuItem } from 'material-ui/Menu';
import { Link } from 'react-router-dom';
import { setCurrentUserByToken } from '../../actions/signin';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

class Header extends React.Component {
  state = {
    anchorEl: null,
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  signout = () => {
    const { domain } = this.props.info;

    this.handleClose();
    localStorage.removeItem(`jwtToken/${domain}`);
    this.props.setCurrentUserByToken(domain, false);
  }

  render() {
    const { classes, site,
      info: { domain },
      auth: { isAuthenticated }
    } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" className={classes.flex}
              component={Link} to={`/${domain}`}
            >
              {site.title}
            </Typography>
            {isAuthenticated ? (
              <div>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : null}
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
                  open={open}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                  <MenuItem onClick={this.handleClose}>My account</MenuItem>
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
      </div>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
};

function mapStateToProps({ info, sites, auth }) {
  return {
    info,
    site: sites[info.domain],
    auth
  };
}

export default connect(mapStateToProps, { setCurrentUserByToken } )(
  withStyles(styles)(Header)
);
