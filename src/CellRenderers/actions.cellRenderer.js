/**
 * Created by Anderson on 27/01/2016.
 */

rz.widgets.tableHelpers.createCellRenderer("actions-renderer", function (value) {
    var sb = new StringBuilder();
    sb.append('<div class="ui icon top right basic pointing dropdown button">');
    sb.append('  <i class="ellipsis vertical icon"></i>');
    sb.append('  <div class="menu">');
    sb.append('    <div class="header">Display Density</div>');
    sb.append('    <div class="item">Comfortable</div>');
    sb.append('    <div class="item">Cozy</div>');
    sb.append('    <div class="item">Compact</div>');
    sb.append('    <div class="ui divider"></div>');
    sb.append('    <div class="item">Settings</div>');
    sb.append('    <div class="item">');
    sb.append('      <i class="dropdown icon"></i>');
    sb.append('      <span class="text">Upload Settings</span>');
    sb.append('      <div class="menu">');
    sb.append('        <div class="item">');
    sb.append('          <i class="check icon"></i>');
    sb.append('          Convert Uploaded Files to PDF');
    sb.append('        </div>');
    sb.append('        <div class="item">');
    sb.append('          <i class="check icon"></i>');
    sb.append('          Digitize Text from Uploaded Files');
    sb.append('        </div>');
    sb.append('      </div>');
    sb.append('    </div>');
    sb.append('    <div class="item">Manage Apps</div>');
    sb.append('    <div class="item">Keyboard Shortcuts</div>');
    sb.append('    <div class="item">Help</div>');
    sb.append('  </div>');
    sb.append('</div>');
    return sb.toString();

});

