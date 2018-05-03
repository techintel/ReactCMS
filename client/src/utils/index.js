import React from 'react';
import _ from 'lodash';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { Typography, TextField, Grid } from 'material-ui';

import axios from 'axios';

import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

export function createCleanHtml(dirtyMarkupSource, markdownFormatted) {
  const cleanHtml = DOMPurify.sanitize(
    markdownFormatted ? marked(dirtyMarkupSource) : dirtyMarkupSource
  );
  return {__html: cleanHtml};
}

function renderTypography({ type, order, title, body, ...custom }, markdownFormatted) {
  const { ...titleCustom } = title;
  const titleContent = titleCustom.content;
  delete titleCustom.content;

  const { ...bodyCustom } = body;
  const bodyContent = bodyCustom.content;
  delete bodyCustom.content;

  bodyCustom.component = bodyCustom.component ? bodyCustom.component : 'div';

  return (
    <Typography component="div" key={order} {...custom}>
      {titleContent ?
        <Typography dangerouslySetInnerHTML={createCleanHtml(titleContent)} {...titleCustom} />
      : null}
      {bodyContent ?
        <Typography dangerouslySetInnerHTML={createCleanHtml(bodyContent, markdownFormatted)} {...bodyCustom} />
      : null}
    </Typography>
  );
}

export const RenderWidgets = ({ contents }) => (
  <div>
    {_.map(_.orderBy(contents, 'order'),
      widget => {
        switch (widget.type) {
          case 'Markdown':
            return renderTypography(widget, true);
          case 'HTML':
            return renderTypography(widget);
          default:
            return;
        }
      }
    )}
  </div>
);

export function setAuthorizationToken(authToken) {
  if (authToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export function renderComposedTextField(
  { input, label, type, autoComplete, meta: { touched, error, submitting }, ...custom }
) {
  const isError = (touched && error !== undefined);

  return (
    <FormControl error={isError} aria-describedby={`${input.name}-text`} disabled={submitting} {...custom}>
      <InputLabel htmlFor={input.name}>{label}</InputLabel>
      <Input id={input.name} type={type} autoComplete={autoComplete} {...input} />
      <FormHelperText id={`${input.name}-text`}>{touched ? error : ""}</FormHelperText>
    </FormControl>
  );
};

export function renderTextField(
  { input, label, Icon, className, meta: { touched, error, submitting }, ...custom }
) {
  const isError = (touched && error !== undefined);

  const field = style => (
    <TextField
      label={isError ? error : label}
      error={isError}
      disabled={submitting}
      className={style}
      {...input}
      {...custom}
    />
  );

  return !Icon ? field(className) : (
    <div className={className}>
      <Grid container spacing={8} alignItems="flex-end">
        <Grid item xs={1}>
          <Icon />
        </Grid>
        <Grid item xs={11}>
          {field()}
        </Grid>
      </Grid>
    </div>
  );
};

export function toSlug(text) {
  let slug = text.replace(/[^\w\s-]/gi, '');
  slug = slug.replace(/\s+/g, '-');
  slug = slug.toLowerCase();
  return slug;
}

export function getWords(str, number) {
  return str.split(/\s+/).slice(0,number).join(" ");
}

export const POST_STATUSES = [
  {
    value: 'publish',
    label: 'Published',
  },
  {
    value: 'draft',
    label: 'Draft',
  },
];

export function getPostStatusLabel(val) {
  const status = _.find(POST_STATUSES, o => {
    return o.value === val;
  });
  return status.label;
}

export function slugNameToValueLabel(slugNames) {
  return _.map(slugNames, o => {
    return {
      value: o.slug,
      label: o.name
    };
  });
}

export function valueLabelToSlugName(valueLabels) {
  return _.map(valueLabels, o => {
    return {
      name: o.label,
      slug: o.value
    };
  });
}
