/*
 * Wazuh app - File for app requirements and set up
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import 'ui/autoload/styles';
import 'uiExports/visTypes';
import 'uiExports/visResponseHandlers';
import 'uiExports/visRequestHandlers';
import 'uiExports/visEditorTypes';
import 'uiExports/savedObjectTypes';
import 'uiExports/spyModes';
import 'uiExports/fieldFormats';
import 'uiExports/fieldFormatEditors';
import 'uiExports/navbarExtensions';
import 'uiExports/managementSections';
import 'uiExports/devTools';
import 'uiExports/docViews';
import 'uiExports/embeddableFactories';
import 'uiExports/autocompleteProviders';
import 'uiExports/interpreter';
import 'angular-sanitize';

// Require CSS
import './less/loader';
// Require lib to dashboards PDFs
require('./utils/dom-to-image.js');

// EUI React components wrapper
import './components';

// angular-charts.js
import 'angular-chart.js';

// pin-wz-menu.js
import { changeWazuhNavLogo } from './utils/wz-logo-menu';

// Font Awesome, Kibana UI framework and others
import './utils/fontawesome/css/font-awesome.min.css';

// Dev tools
import './utils/codemirror';

import './utils/jquery-ui';

// Material
import 'angular-material/angular-material.css';
import 'angular-aria/angular-aria';
import 'angular-animate/angular-animate';
import 'angular-material/angular-material';

// Cookies
import 'angular-cookies/angular-cookies';

import 'ui/autoload/all';
import chrome from 'ui/chrome';

// Set up Wazuh app
import './setup';

//App imports
import './kibana-integrations';
import './services';
import './controllers';
import './factories';
import './directives';

import { getAngularModule } from 'plugins/kibana/discover/kibana_services';
const app = getAngularModule('app/wazuh');

app.config([
  '$compileProvider',
  function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(
      /^\s*(https?|ftp|mailto|data|blob):/
    );
  }
]);

app.config([
  '$httpProvider',
  function($httpProvider) {
    $httpProvider.useApplyAsync(true);
  }
]);

app.run(function() {
  chrome
    .setRootTemplate(
      `<div>
        <wz-menu></wz-menu><div ng-view></div>
         </div>
         `
    )
    .setRootController(() => require('./app'));
  changeWazuhNavLogo();
});
