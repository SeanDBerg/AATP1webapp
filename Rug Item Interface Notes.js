/**
 *       <div id="left-side-nav" class="left-side-nav">
        <div onclick="navbarSelection(this, 'client-info')"
          class="nav-header-selected nav-header valign-text-middle gothica1-normal-charade-16px">
          Main
        </div>
        <div onclick="navbarSelection(this, 'item-info-1')" id="item-navbar-1"
          class="nav-header-unselected nav-header valign-text-middle gothica1-normal-charade-16px">
          Item 1
        </div>
        <div onclick="createNewItem(this)" class="add-item valign-text-middle gothica1-light-charade-14px">
          + Add Item
        </div>
        <div onclick="navbarSelection(this, 'freight-section')"
          class="nav-header-unselected nav-header valign-text-middle gothica1-normal-charade-16px">
          Freight
        </div>
        <div onclick="navbarSelection(this, 'tracking-section')"
          class="nav-header-unselected nav-header valign-text-middle gothica1-normal-charade-16px">
          Tracking
        </div>
        <div onclick="navbarSelection(this, 'payments-section')"
          class="nav-header-unselected nav-header valign-text-middle gothica1-normal-charade-16px">
          Payments
        </div>
        <div onclick="navbarSelection(this, 'summary-section')"
          class="nav-header-unselected nav-header valign-text-middle gothica1-normal-charade-16px">
          Summary
        </div>
      </div>
 * 
 * 
 * use data-key or data-header to data-sdflasdfzhsfd = "sfasdfX"
 * 
 * 
 * 
 * 
 * 
 * 
 */



function makeEditInSheet(headerName, newValue, destinationsObject) {
  const { destination } = destinationsObject.globals;

  return
  const e = getStaticEventObject(modalGlobalObject);

  e.userChanges = { [headerName]: newValue };
  e.modalGlobalObject = modalGlobalObject;
  userPortalEdit(e, "modal_edit");

  if (headerName == "Notes") return noteEditContents
}













