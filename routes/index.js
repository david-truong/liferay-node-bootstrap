
/*
 * GET home page.
 */

exports.index = function(req, res){
  var layout = Liferay.getLayoutByFriendlyURL(req.url);
  if (layout) {
    res.render(layout['layout-template-id'], { title: layout.nameCurrentValue, columns: layout.columns, currentLayout: layout, layouts: Liferay.layouts });
  }
  else {
    res.render('404', { title: 'Not Found' });
  }
};