import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Divider, Button } from '@material-ui/core';
import { FormatSize, FormatAlignRight } from '@material-ui/icons';
import SelectField from '../../../../components/Selections/SelectField';
import { renderTextField, hasBeenText } from '../../../../utils';
import { saveWidget, deleteWidget } from '../../../../actions/fetchSite';
import { openSnackbar } from '../../../../actions/openSnackbar';
import { VARIANTS, ALIGNS } from '../Constants';

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

const variants_valueLabels = VARIANTS.map(el => { return { value: el, label: el }; });
const aligns_valueLabels = ALIGNS.map(el => { return { value: el, label: el }; });

const ElementProp = ({ xs, elem, label, Icon, options }) => {
  return (
    <Grid item xs={xs}>
      <Field
        name={`${elem}${label}`}
        component={SelectField}
        label={label}
        icon={<Icon />}
        options={options}
        fullWidth
      />
    </Grid>
  );
}

class MarkdownHtml extends Component {
  componentDidMount() {
    const { data: { title, body } } = this.props;

    const titleVariant = title && title.variant ? title.variant : 'body1';
    const titleAlign = title && title.align ? title.align : 'inherit';
    const titleContent = title ? title.content : null;

    const bodyVariant = body && body.variant ? body.variant : 'body1';
    const bodyAlign = body && body.align ? body.align : 'inherit';
    const bodyContent = body ? body.content : null;

    this.props.initialize({
      titleVariant, titleAlign, titleContent,
      bodyVariant, bodyAlign, bodyContent,
    });
  }

  submit = values => {
    const { area, data: { _id, type, order } } = this.props;

    return this.props.saveWidget( area, {
      _id, type, order,
      title: {
        variant: values.titleVariant,
        align: values.titleAlign,
        content: values.titleContent,
      },
      body: {
        variant: values.bodyVariant,
        align: values.bodyAlign,
        content: values.bodyContent,
      },
    }, () => {
      this.props.openSnackbar(hasBeenText(`A ${area.replace(/_/g, " ")}`, 'widget', 'saved'));
    } );
  }

  render () {
    const { area, data, handleSubmit, pristine, submitting, classes } = this.props;

    return (
      <form onSubmit={handleSubmit(this.submit)}>
        <Grid container className={classes.root}>

          <ElementProp xs={7} elem="title" label="Variant" Icon={FormatSize} options={variants_valueLabels} />
          <ElementProp xs={5} elem="title" label="Align" Icon={FormatAlignRight} options={aligns_valueLabels} />
          <Field
            name="titleContent"
            component={renderTextField}
            label="Title"
            fullWidth
          />

          <Divider className={classes.divider} />

          <ElementProp xs={7} elem="body" label="Variant" Icon={FormatSize} options={variants_valueLabels} />
          <ElementProp xs={5} elem="body" label="Align" Icon={FormatAlignRight} options={aligns_valueLabels} />
          <Field
            name="bodyContent"
            component={renderTextField}
            label="Body"
            fullWidth
            multiline
            rows={5}
          />

          <div className={classes.buttons}>
            <Button disabled={submitting} color="secondary" onClick={() => this.props.deleteWidget(area, data)}>
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

MarkdownHtml.propTypes = {
  classes: PropTypes.object.isRequired,
  area: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  initialize: PropTypes.func.isRequired,
  saveWidget: PropTypes.func.isRequired,
  deleteWidget: PropTypes.func.isRequired,
  openSnackbar: PropTypes.func.isRequired,
};

export default reduxForm()(
  connect(null, { saveWidget, deleteWidget, openSnackbar })(
    withStyles(styles)(MarkdownHtml)
  )
);
