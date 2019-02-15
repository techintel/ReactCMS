import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Button, Typography, Input } from '@material-ui/core';
import {
  Email,
  Security,
  VerifiedUser,
  AccountCircle
} from '@material-ui/icons';
import {
  signinWithEmail,
  signinAsyncValidate as asyncValidate,
  setCurrentUserByToken
} from '../../actions/signin';
import { renderTextField } from '../../utils';
import Head from '../Parts/Head';

const styles = theme => ({
  header: {
    textAlign: 'center',
    margin: `${theme.spacing.unit * 5}px 0`
  },
  paper: {
    margin: `0 auto`,
    padding: theme.spacing.unit * 6,
    maxWidth: 600
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  button: {
    margin: theme.spacing.unit
  }
});

function validate(values) {
  const { email, username, password, code } = values;
  const errors = {};

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.email = 'Invalid email address';
  }
  if (!username || !/^[A-Z0-9_-]+$/i.test(username)) {
    errors.username = 'Invalid username';
  }
  if (!password) {
    errors.password = 'Invalid password';
  }
  if (!code) {
    errors.code = 'Invalid verification code';
  }

  return errors;
}

const Container = ({ Icon, title, description, form, classes }) => {
  return (
    <div>
      <Head name={title} description={description} />
      <div className={classes.header}>
        <Icon color="primary" style={{ height: 70, width: 70 }} />
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="caption">{description}</Typography>
      </div>
      <Paper className={classes.paper} elevation={4}>
        {form}
      </Paper>
    </div>
  );
};

const Submit = ({
  label,
  props: { pristine, submitting, invalid, classes }
}) => {
  return (
    <Button
      type="submit"
      disabled={pristine || submitting || invalid}
      variant="contained"
      size="large"
      color="primary"
      className={classes.button}
      fullWidth
    >
      {label}
    </Button>
  );
};

class Signin extends Component {
  state = {
    email: null,
    isEmailUsed: null,
    isVerificationSent: null,
    isVerified: null
  };

  componentWillMount() {
    const { info } = this.props;

    this.props.initialize({
      collectionPrefix: info.collectionPrefix
    });
  }

  onSubmit(values) {
    const { info } = this.props;

    return signinWithEmail(values, data => {
      const { state, token } = data;

      if (state) {
        this.setState(state);
      } else if (token) {
        localStorage.setItem(`jwtToken/${info.domain}`, token);

        this.props.setCurrentUserByToken(info.domain, token);
        this.props.history.push(`/${info.domain}`);
      }
    });
  }

  render() {
    const { handleSubmit, classes } = this.props;
    const { email, isEmailUsed, isVerificationSent, isVerified } = this.state;

    if (!isVerificationSent) {
      if (isEmailUsed) {
        return (
          <Container
            Icon={AccountCircle}
            title="Please enter your password"
            description={`Sign in with your email: ${email}`}
            form={
              <form
                className={classes.form}
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
              >
                <Input
                  defaultValue={email}
                  autoComplete="email"
                  style={{ display: 'none' }}
                />
                <Field
                  name="password"
                  type="password"
                  component={renderTextField}
                  label="Password"
                  autoComplete="new-password"
                  fullWidth
                  required
                />
                <Submit label="Sign in" props={this.props} />
              </form>
            }
            classes={classes}
          />
        );
      } else {
        return (
          <Container
            Icon={Email}
            title="Create an account or sign in"
            description="Use a new email to create an account or log in with your existing one."
            form={
              <form
                className={classes.form}
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
              >
                <Field
                  name="collectionPrefix"
                  type="hidden"
                  component={Input}
                />
                <Field
                  name="email"
                  component={renderTextField}
                  label="Email"
                  fullWidth
                  required
                />
                <Submit label="Next" props={this.props} />
              </form>
            }
            classes={classes}
          />
        );
      }
    } else if (isVerificationSent) {
      if (!isVerified) {
        return (
          <Container
            Icon={Security}
            title="Check your inbox"
            description={`Please enter the 4 digit code sent to: ${email}`}
            form={
              <form
                className={classes.form}
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
              >
                <Field
                  name="code"
                  component={renderTextField}
                  label="Verification code"
                  fullWidth
                  required
                />
                <Submit label="Confirm" props={this.props} />
              </form>
            }
            classes={classes}
          />
        );
      } else if (isVerified) {
        return (
          <Container
            Icon={VerifiedUser}
            title="Finish your registration"
            description={`Complete your registration by filling up this form.`}
            form={
              <form
                className={classes.form}
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
              >
                <Field
                  name="username"
                  component={renderTextField}
                  label="Username"
                  autoComplete="username"
                  fullWidth
                  required
                />
                <Field
                  name="password"
                  type="password"
                  component={renderTextField}
                  label="Password"
                  autoComplete="current-password"
                  fullWidth
                  required
                />
                <Submit label="Register" props={this.props} />
              </form>
            }
            classes={classes}
          />
        );
      }
    }
  }
}

Signin.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  info: PropTypes.object.isRequired,
  setCurrentUserByToken: PropTypes.func.isRequired
};

function mapStateToProps({ info }) {
  return { info };
}

const wrappedForm = reduxForm({
  form: 'Signin',
  validate,
  asyncValidate
})(Signin);
const wrappedConnect = connect(
  mapStateToProps,
  { setCurrentUserByToken }
)(wrappedForm);

export default withStyles(styles)(wrappedConnect);
