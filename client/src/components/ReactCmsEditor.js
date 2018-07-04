import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { withStyles } from '@material-ui/core/styles';

import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const styles = theme => ({
  root: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px`,
  },
  wrapper: {
    border: `2px solid ${theme.palette.background.paper}`,
  },
  editor: {
    minHeight: 250,
    margin: theme.spacing.unit,
    color: theme.typography.body1.color,
  },
});

class ReactCmsEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    if (props.content) {
      this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(props.content)));
    } else {
      this.state.editorState = EditorState.createEmpty();
    }
  }

  componentDidMount() {
    this.onEditorStateChange(this.state.editorState);
  }

  onEditorStateChange = editorState => {
    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));

    this.setState({ editorState });
    this.props.onChange(content);
  }

  render() {
    const { editorState } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Editor
          editorState={editorState}
          wrapperClassName={classes.wrapper}
          editorClassName={classes.editor}
          onEditorStateChange={this.onEditorStateChange}
        />
      </div>
    );
  }
}

ReactCmsEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  content: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ReactCmsEditor);
