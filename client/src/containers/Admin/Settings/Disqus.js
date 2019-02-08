import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography, Grid, Button } from '@material-ui/core';
import { renderTextField, hasBeenText } from '../../../utils';
import { documentTitle } from '../../../utils/reactcms';
import { configureSettings } from '../../../actions/fetchSite';
import { openSnackbar } from '../../../actions/openSnackbar';

import CheckboxGroup from '../../../components/Selections/CheckboxGroup';

const ENABLED_ON_CHOICES = [
  { value: 'posts', label: 'Posts' },
  { value: 'pages', label: 'Pages' },
];

const styles = theme => ({
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  form: {
    padding: theme.spacing.unit,
  },
  shortnameLabel: {
    marginTop: theme.spacing.unit * 3,
  },
  enabledOnLabel: {
    marginTop: theme.spacing.unit * 2,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class Disqus extends Component {
  state = { formInitialized: false };

  componentDidMount() {
    const { disqus } = this.props.site;

    if (disqus) this.props.initialize(disqus);
    this.setState({ formInitialized: true });

    documentTitle('Disqus Comment System');
  }

  submit = values => {
    return this.props.configureSettings( 'disqus', values, () => {
      this.props.openSnackbar(hasBeenText('Disqus', 'site configuration', 'updated'));
    } );
  }

  render() {
    const { handleSubmit, pristine, submitting, classes } = this.props;
    const { formInitialized } = this.state;

    return (
      <div>
        <Typography variant="h5" component="h3">
          Disqus Comment System
        </Typography>
        <Typography paragraph>
          Install Disqus manually on this ReactCMS site by entering your site's shortname and enabling Disqus comment system on specific types of posts.
        </Typography>

        <Paper className={classes.paper}>
          <form onSubmit={handleSubmit(this.submit)} className={classes.form}>

            <Grid container>
              <Grid item xs={12} sm={3}>
                <Typography noWrap className={classes.shortnameLabel}>
                  Unique identifier:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Field name="shortname" component={renderTextField} label="Shortname" fullWidth />
              </Grid>
            </Grid>

            {formInitialized && (
              <Grid container>
                <Grid item xs={12} sm={3}>
                  <Typography noWrap className={classes.enabledOnLabel}>
                    Enabled on:
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Field name="enabled_on" component={CheckboxGroup} options={ENABLED_ON_CHOICES} />
                </Grid>
              </Grid>
            )}

            <Button
              type="submit" disabled={pristine || submitting}
              variant="contained" size="large" color="secondary" className={classes.button}
            >
              Save
            </Button>

          </form>
        </Paper>
      </div>
    );
  }
}

Disqus.propTypes = {
  classes: PropTypes.object.isRequired,
  initialize: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  site: PropTypes.object.isRequired,
  configureSettings: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

function mapStateToProps({ sites, info: { domain } }) {
  return {
    site: sites[domain],
  };
}

export default reduxForm({
  form: 'Disqus'
})(
  connect(mapStateToProps, { configureSettings, openSnackbar })(
    withStyles(styles)(Disqus)
  )
);
