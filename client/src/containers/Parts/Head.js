import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { capitalizeFirstLetter } from '../../utils';

const Head = ({ name, description, children, title }) => {
  const titleContent = name
    ? `${capitalizeFirstLetter(name)} - ${title}`
    : title;

  return (
    <Helmet>
      <title>{titleContent}</title>
      {description && <meta name="description" content={description} />}
      {children}
    </Helmet>
  );
};

Head.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string.isRequired,
  children: PropTypes.node,
  title: PropTypes.string
};

function mapStateToProps({ sites, info: { domain } }) {
  return { title: sites[domain].title };
}

export default connect(mapStateToProps)(Head);
