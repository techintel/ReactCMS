const express = require('express');
const router = express.Router();
const { Site } = require('../models');

router.get('/:site?', (req, res, next) => {
  const { site } = req.params;

  Site.findOne( { '_id.domain': (site ? site : "") })
  .then(doc => {
    if (doc) {
      res.send(doc);
    } else {
      Site.findOne({ '_id.domain': "" })
      .then(doc => res.send(doc));
    }
  });
});

module.exports = router;
