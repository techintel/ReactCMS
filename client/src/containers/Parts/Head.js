import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { capitalizeFirstLetter } from '../../utils';

const Head = ({ name, description, children, site }) => {
  const titleContent = name
    ? `${capitalizeFirstLetter(name)} - ${site.title}`
    : site.title;

  return (
    <Helmet>
      <title>{titleContent}</title>
      <meta
        name="description"
        content={description ? description : site.description}
      />
      {children}
    </Helmet>
  );
};

Head.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  site: PropTypes.object.isRequired
};

function mapStateToProps({ sites, info: { domain } }) {
  return { site: sites[domain] };
}

export default connect(mapStateToProps)(Head);
