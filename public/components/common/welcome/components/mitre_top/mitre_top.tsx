/*
 * Wazuh app - React component information about MITRE top tactics.
 *
 * Copyright (C) 2015-2020 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFacetButton,
  EuiButtonIcon,
  EuiLoadingChart,
  EuiOverlayMask,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { FlyoutTechnique } from '../../../../../components/overview/mitre/components/techniques/components/flyout-technique';
import { getIndexPattern } from '../../../../../components/overview/mitre/lib';
import { getServices } from 'plugins/kibana/discover/kibana_services';
import { getMitreCount } from './lib';
export class MitreTopTactics extends Component {
  _isMount = false;

  KibanaServices: { [key: string]: any };
  timefilter: any;
  indexPattern: any;
  props!: {
      [key: string]: any
  }
  state: {
    alertsCount: { key: string, doc_count:number }[]
    isLoading: boolean,
    time: any,
    filterParams: object,
    selectedTactic: string | undefined,
    detailsOn: boolean,
    flyoutOn: boolean,
    selectedTechnique: string
  }
  subscription: any;

  constructor(props) {
    super(props);
    this.KibanaServices = getServices();
    this.timefilter = this.KibanaServices.timefilter;
    this.state = {
      alertsCount: [],
      isLoading: true,
      time: this.timefilter.getTime(),
      selectedTactic: undefined,
      detailsOn: false,
      flyoutOn: false,
      selectedTechnique: ''
    };
  }

  async componentDidMount() {
    this._isMount = true;
    this.subscription = this.timefilter.getTimeUpdate$().subscribe(
      () => this._isMount && this.setState({time: this.timefilter.getTime(), isLoading: true}));
    this.indexPattern = await getIndexPattern();
    getMitreCount(this.props.agentId, this.timefilter.getTime(), undefined)
      .then(alertsCount => this.setState({alertsCount, isLoading: false}));
  }

  async componentWillUnmount() {
    this._isMount = false;
    this.subscription.unsubscribe();
  }

  shouldComponentUpdate(nextProp, nextState) {
    const { selectedTactic, isLoading, alertsCount } = this.state;
    if (nextState.selectedTactic !== selectedTactic ) 
      return true;
    if (!isLoading ) 
      return true;
    if (JSON.stringify(nextState.alertsCount) !== JSON.stringify(alertsCount))
      return true;
    return false;
  }
  
  async componentDidUpdate(){
    const { selectedTactic, isLoading } = this.state;
    if (isLoading) {
      getMitreCount(this.props.agentId, this.timefilter.getTime(), selectedTactic)
        .then(alertsCount => { this.setState({alertsCount, isLoading: false}) });
    }
  }

  renderLoadingStatus() {
    const { isLoading } = this.state;
    if(!isLoading) return
    return(
      <div style={{ display: 'block' , textAlign: "center", paddingTop: 100 }}>
        <EuiLoadingChart size="xl" />
      </div>
    )
  }

  renderTacticsTop() {
    const { alertsCount, isLoading } = this.state;
    if (isLoading || alertsCount.length === 0) return;
    return (
      <Fragment>
        <EuiText size="xs">
          <EuiFlexGroup>
            <EuiFlexItem style={{margin: 0, padding: '12px 0px 0px 10px'}}>
              <h3>Top Tactics</h3>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiText>
        <EuiFlexGroup>
          <EuiFlexItem>
            {alertsCount.map((tactic) => (
              <EuiFacetButton
                key={tactic.key}
                quantity={tactic.doc_count}
                onClick={() => {
                  this.setState({
                      selectedTactic: tactic.key,
                      isLoading: true,
                    });
                  }
                }
              >
                {tactic.key}
              </EuiFacetButton>
            ))}
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }

  renderTechniques() {
    const { selectedTactic, alertsCount, isLoading } = this.state;
    if (isLoading) return;
    return (
      <Fragment>  
        <EuiText size="xs">
          <EuiFlexGroup>
           <EuiFlexItem grow={false} >
            <EuiButtonIcon
              size={'s'}
              color={'primary'}
              onClick={() => {
                this.setState({
                    selectedTactic: undefined,
                    isLoading: true,
                    flyoutOn: false
                  });
                }
              }
              iconType="sortLeft"
              aria-label="Back Top Tactics"
            />
            </EuiFlexItem>
            <EuiFlexItem >
              <h3>{selectedTactic}</h3>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiText>
        <EuiFlexGroup>
          <EuiFlexItem>
            {alertsCount.map((tactic) => (
              <EuiFacetButton
                key={tactic.key}
                quantity={tactic.doc_count}
                onClick={() => this.showFlyout(tactic.key)}
              >
                {tactic.key}
              </EuiFacetButton>
            ))}
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }

  renderEmptyPrompt() {
    const { isLoading } = this.state;
    if (isLoading) return;
    return(
      <EuiEmptyPrompt
      iconType="stats"
      title={<h4>You dont have tactics for this time range</h4>}
      body={
        <Fragment>
          <p>
          You have no alerts related to tactics in this time range. 
          Modify the time range to view data, if it exists.
          </p>
        </Fragment>
      }
      />
    )
  }

  onChangeFlyout = (flyoutOn ) => {
    this.setState({ flyoutOn });
  }

  closeFlyout() {
    this.setState({ flyoutOn: false });
  }

  showFlyout(tactic) {
    this.setState({
      selectedTechnique: tactic,
      flyoutOn: true
    })
  }

  render() {
    const { flyoutOn, selectedTactic, selectedTechnique, alertsCount } = this.state;
    const tacticsTop = this.renderTacticsTop();
    const tecniquesTop = this.renderTechniques();
    const loading = this.renderLoadingStatus();
    const emptyPrompt = this.renderEmptyPrompt();
    return (
      <Fragment>
        {loading}        
        {!selectedTactic ? tacticsTop : tecniquesTop}
        {alertsCount.length === 0 && emptyPrompt}
        {flyoutOn &&
        <EuiOverlayMask onClick={(e: Event) => { e.target.className === 'euiOverlayMask' && this.closeFlyout() }} >
          <FlyoutTechnique 
            onChangeFlyout={this.onChangeFlyout}
            currentTechnique={selectedTechnique}/>
        </EuiOverlayMask>}
      </Fragment>
    )
  }
}