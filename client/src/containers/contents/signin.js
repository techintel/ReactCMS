import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { Paper, Button, Typography } from 'material-ui';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import { Email, Security, VerifiedUser, AccountCircle } from 'material-ui-icons';
import { signinWithEmail, signinAsyncValidate as asyncValidate, setCurrentUserByToken } from '../../actions/signin';

const styles = theme => ({
  header: {
    textAlign: 'center',
    margin: `${theme.spacing.unit * 3}px 0`,
  },
  paper: {
    margin: `0 auto`,
    padding: theme.spacing.unit * 6,
    maxWidth: 600,
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    width: '100%',
  },
  button: {
    margin: theme.spacing.unit,
    width: '100%',
  },
});

const Container = (
  { Icon, title, description, form, classes }
) => {
  return (
    <div>
      <div className={`App-header ${classes.header}`}>
        <Icon color="primary" style={{ height: 70, width: 70 }} />
        <Typography variant="subheading" gutterBottom className="App-title">
          {title}
        </Typography>
        <Typography variant="caption">
          {description}
        </Typography>
      </div>
      <Paper className={classes.paper} elevation={4}>
        {form}
      </Paper>
    </div>
  );
}

const Submit = (
  { label, props: { pristine, submitting, invalid, classes } }
) => {
  return (
    <Button type="submit" disabled={pristine || submitting || invalid} variant="raised" size="large" color="primary" className={classes.button}>
      {label}
    </Button>
  );
}

const renderTextField = (
  { input, label, type, meta: { touched, error, submitting }, ...custom }
) => {
  return (
    <FormControl error={touched && error !== undefined} aria-describedby={`${input.name}-text`} disabled={submitting} required {...custom}>
      <InputLabel htmlFor={input.name}>{label}</InputLabel>
      <Input id={input.name} type={type} {...input} />
      <FormHelperText id={`${input.name}-text`}>{touched ? error : ""}</FormHelperText>
    </FormControl>
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

  onSubmit(formData) {
    const { info } = this.props;

    return signinWithEmail(formData, data => {
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

  render () {
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
              <form className={classes.form} onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <Field name="password" type="password" component={renderTextField} label="Password" className={classes.textField} />
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
              <form className={classes.form} onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <Field name="collectionPrefix" type="hidden" component={Input} />
                <Field name="email" component={renderTextField} label="Email" className={classes.textField} />
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
              <form className={classes.form} onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <Field name="code" component={renderTextField} label="Verification code" className={classes.textField} />
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
              <form className={classes.form} onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <Field name="username" component={renderTextField} label="Username" className={classes.textField} />
                <Field name="password" type="password" component={renderTextField} label="Password" className={classes.textField} />
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
};

function validate(values) {
  const { email, username, password, code } = values;
  const errors = {};

  if ( !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email) ) {
    errors.email = 'Invalid email address';
  }
  if ( !username || !/^[A-Z0-9_-]+$/i.test(username) ) {
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

function mapStateToProps({ info, sites }) {
  return {
    info,
    site: sites[info.domain]
  };
}

export default reduxForm({
  form: 'signin',
  validate,
  asyncValidate
})(
  connect(mapStateToProps, { setCurrentUserByToken } )(
    withStyles(styles)(Signin)
  )
);
