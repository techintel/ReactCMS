import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { GridList, GridListTile, GridListTileBar, ListSubheader, Button } from '@material-ui/core';
import { SERVER_ROOT_URL } from '../../../config';
import { switchTheme } from '../../../actions/fetchSite';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: '100%',
  },
  gridListTile: {
    backgroundColor: theme.palette.background.default,
    margin: theme.spacing.unit,
  },
  button: {
    color: theme.palette.primary.contrastText,
    border: '1px solid rgba(255, 255, 255, 0.23)',
  },
});

class Themes extends Component {
  state = { activating: false };

  handleError = name => { this.setState({ [name]: true }); }

  handleClick = tile => {
    this.setState({ activating: true });
    this.props.switchTheme( tile.template, () => { this.setState({ activating: false }); } );
  }

  render() {
    const { classes, site: { themes, template } } = this.props;
    const { activating } = this.state;

    return (
      <div className={classes.root}>
        <GridList cellHeight={180} className={classes.gridList} cols={3}>
          <GridListTile key="Subheader" cols={3} style={{ height: 'auto' }}>
            <ListSubheader component="div">Themes</ListSubheader>
          </GridListTile>
          {themes.map( tile => {
            const errorName = `errored-${tile.template}`;
            const isCurrentTemplate = template === tile.template;

            return (
              <GridListTile key={tile.template} className={classes.gridListTile}>
                {this.state[ errorName ] ? null :
                  <img alt={tile.name}
                    src={`${SERVER_ROOT_URL}/upload/themes/${tile.template}/screenshot.png`}
                    onError={() => this.handleError(errorName)}
                  />
                }
                <GridListTileBar
                  title={tile.name}
                  subtitle={<span>by: {tile.author}</span>}
                  actionIcon={
                    <Button variant="outlined" className={classes.button}
                      disabled={isCurrentTemplate || activating}
                      onClick={() => this.handleClick(tile)}
                    >
                      Activate{isCurrentTemplate && 'd'}
                    </Button>
                  }
                />
              </GridListTile>
            );
          } )}
        </GridList>
      </div>
    );
  }
}

Themes.propTypes = {
  classes: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
  switchTheme: PropTypes.func.isRequired,
};

function mapStateToProps({ sites, info: { domain } }) {
  return { site: sites[domain] };
}

export default connect(mapStateToProps, { switchTheme })(
  withStyles(styles)(Themes)
);
