import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Divider, Button } from '@material-ui/core';
import { BorderHorizontal, Menu as MenuIcon } from '@material-ui/icons';
import SelectField from '../../../../../components/Selections/SelectField';
import { renderTextField, hasBeenText, capitalizeFirstLetter } from '../../../../../utils';
import { saveWidget } from '../../../../../actions/fetchSite';
import { openSnackbar } from '../../../../../actions/openSnackbar';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
  },
  divider: {
    width: '100%',
    marginBottom: theme.spacing.unit,
  },
  buttons: {
    width: '100%',
    textAlign: 'right',
  },
});

const directions = [ 'horizontal', 'vertical' ];
const directions_valueLabels = directions.map(el => ({ value: el, label: capitalizeFirstLetter(el) }) );

const ElementProp = ({ xs, elem, label, Icon, options }) => {
  return (
    <Grid item xs={xs}>
      <Field
        name={elem}
        component={SelectField}
        label={label}
        icon={<Icon />}
        options={options}
        fullWidth
      />
    </Grid>
  );
}

class Menu extends Component {
  state = { menus: [] };

  componentDidMount() {
    let { data: { title } } = this.props;
    const { menus, data: { body } } = this.props;

    title = title ? title : "";
    const direction = body && body.direction ? body.direction : "horizontal";
    const menuId = body && body.menuId ? body.menuId : null;

    this.props.initialize({ title, direction, menuId });
    this.setState({
      menus: menus.map( el => ({ value: el._id, label: el.name }) ),
    });
  }

  submit = values => {
    const { area, data: { _id, type, order } } = this.props;

    return this.props.saveWidget( area, {
      _id, type, order,
      title: values.title,
      body: {
        direction: values.direction,
        menuId: values.menuId,
      },
    }, () => {
      this.props.openSnackbar(hasBeenText(`A ${area.replace(/_/g, " ")}`, 'widget', 'saved'));
    } );
  }

  render () {
    const { handleDeleteWidget, area, data, openId, handleSubmit, pristine, submitting, classes } = this.props;
    const { menus } = this.state;

    return (
      <form onSubmit={handleSubmit(this.submit)}>
        <Grid container className={classes.root}>

          <Field
            name="title"
            component={renderTextField}
            label="Title"
            fullWidth
          />
          <ElementProp xs={12} elem="direction" label="Direction" Icon={BorderHorizontal} options={directions_valueLabels} />

          <Divider className={classes.divider} />

          <ElementProp xs={12} elem="menuId" label="Menu" Icon={MenuIcon} options={menus} />

          <Divider className={classes.divider} />

          <div className={classes.buttons}>
            <Button disabled={submitting} color="secondary" onClick={handleDeleteWidget(area, data, openId)}>
              Delete
            </Button>
            <Button type="submit" disabled={pristine || submitting} variant="contained" color="primary">
              Save
            </Button>
          </div>

        </Grid>
      </form>
    );
  }
}

Menu.propTypes = {
  classes: PropTypes.object.isRequired,
  handleDeleteWidget: PropTypes.func.isRequired,
  area: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  openId: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  saveWidget: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,

  menus: PropTypes.array.isRequired,
};

function mapStateToProps({ sites, info: { domain } }) {
  return {
    menus: sites[domain].menus,
  };
}

Menu = reduxForm()(
  connect(mapStateToProps, { saveWidget, openSnackbar })(
    withStyles(styles)(Menu)
  )
);
export { Menu };
