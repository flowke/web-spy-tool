import*as Common from"../common/common.js";import*as Host from"../host/host.js";import*as Workspace from"../workspace/workspace.js";import{FilteredUISourceCodeListProvider}from"./FilteredUISourceCodeListProvider.js";import{SourcesView}from"./SourcesView.js";export class OpenFileQuickOpen extends FilteredUISourceCodeListProvider{attach(){this.setDefaultScores(SourcesView.defaultUISourceCodeScores()),super.attach()}uiSourceCodeSelected(e,o,r){Host.userMetrics.actionTaken(Host.UserMetrics.Action.SelectFileFromFilePicker),e&&("number"==typeof o?Common.Revealer.reveal(e.uiLocation(o,r)):Common.Revealer.reveal(e))}filterProject(e){return!e.isServiceProject()}renderAsTwoRows(){return!0}}