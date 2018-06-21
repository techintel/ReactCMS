import React from 'react';
import _ from 'lodash';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { Typography,
  FormControl, FormHelperText,
  Input, InputLabel, InputAdornment
} from '@material-ui/core';
import axios from 'axios';

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
      {titleContent &&
        <Typography dangerouslySetInnerHTML={createCleanHtml(titleContent)} {...titleCustom} />
      }
      {bodyContent &&
        <Typography dangerouslySetInnerHTML={createCleanHtml(bodyContent, markdownFormatted)} {...bodyCustom} />
      }
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

export function renderTextField(
  { input, label, startAdornment, endAdornment, multiline, rows, type, autoComplete, meta: { touched, error, submitting }, ...custom }
) {
  const isError = (touched && error !== undefined);

  return (
    <FormControl error={isError} aria-describedby={`${input.name}-text`} disabled={submitting} {...custom}>
      <InputLabel htmlFor={input.name}>{label}</InputLabel>
      <Input id={input.name} type={type} autoComplete={autoComplete} {...input}
        startAdornment={startAdornment ?
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        : null}
        endAdornment={endAdornment ?
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        : null}
        multiline={multiline} rows={rows}
      />
      <FormHelperText id={`${input.name}-text`}>{touched ? error : ""}</FormHelperText>
    </FormControl>
  );
};

export function slashDomain(domain) {
  return `${domain ? '/' : ''}${domain}`;
}

export function toSlug(text) {
  let slug = text.replace(/[^\w\s-]/gi, '');
  slug = slug.replace(/\s+/g, '-');
  slug = slug.toLowerCase();
  return slug;
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
  {
    value: 'trash',
    label: 'Bin',
  },
];

export function getPostStatusLabel(val) {
  const status = _.find(POST_STATUSES, o => {
    return o.value === val;
  });
  return status.label;
}

export function idNameToValueLabel(idNames) {
  return _.map(idNames, o => {
    return {
      value: o._id,
      label: o.name
    };
  });
}

export function slugNameToValueLabel(slugNames) {
  return _.map(slugNames, o => {
    return {
      value: o.slug,
      label: o.name
    };
  });
}

export function slugTitleToValueLabel(slugTitles) {
  return _.map(slugTitles, o => {
    return {
      value: o.slug,
      label: o.title
    };
  });
}

export function hasBeenText(type, name, action) {
  return capitalizeFirstLetter(`${type} "${name}" has been ${action}.`);
}

export function newCreatedText(type, name) {
  return capitalizeFirstLetter(`New ${type} named "${name}" is created.`);
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}

export function getFiltering(post, type, filter) {
  let group, isIncluded = filter ? false : true;

  if ( !isIncluded ) {
    switch (type) {
      case 'post':
        group = post.categories;
        break;

      case 'page':
        group = post.ancestors;
        break;

      default: break;
    }

    group.forEach(el => {
      if ( el.slug === filter ) {
        isIncluded = true;
        return;
      }
    });
  }

  return isIncluded;
}
