//
// Copyright (c) 2011 Frédéric Bertolus.
//
// This file is part of Yack.
// Yack is free software: you can redistribute it and/or modify it
// under the terms of the GNU Affero General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// Yack is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for
// more details.
// You should have received a copy of the GNU Affero General Public License along
// with Yack. If not, see http://www.gnu.org/licenses/.
//

function YackUI() {

    this.init = function() {
        this.userBlockDomElement = document.getElementById("user_block");
        this.tabsBlockDomElement = document.getElementById("tabs_block");
        this.contentBlockDomElement = document.getElementById("content_panel");
        this.consoleBlockDomElement = document.getElementById("tabs_yack_console");
        
    }
    
    this.run = function() {
        this.yackAuthComponent = new YackAuthComponent(this.userBlockDomElement);
        this.yackTabManager = new YackTabManager(this.tabsBlockDomElement, this.contentBlockDomElement);
        
        
        this.yackTabManager.addTab(new YackUploadTab());
        this.yackTabManager.addTab(new YackFilesTab());
        this.yackTabManager.addTab(new YackSettingsTab());
        this.yackTabManager.addTab(new YackMoreTabsTab());
    }
    
    this.init();

}


function YackTabManager(tabRootComponent, contentRootComponent) {

    this.tabRootComponent = tabRootComponent;
    this.contentRootComponent = contentRootComponent;
    
    
    this.init = function() {
        this.tabList = [];
        this.headerMap = {};
        this.contentMap = {};
        this.selectedTab = null
    }
    
    this.addTab = function(tab) {
        this.tabList.push(tab);
        
        var tabHeaderBlock =  document.createElement('div');
        tabHeaderBlock.setAttribute("class", "yack_unselected_tab_header");
        var tabHeaderTitleBlock =  document.createElement('div');
        tabHeaderTitleBlock.setAttribute("class", "yack_tab_header_title");
        var tabHeaderContentBlock =  document.createElement('div');
        tabHeaderContentBlock.setAttribute("class", "yack_tab_header_content");
        
        tabHeaderTitleBlock.appendChild(tab.getHeaderTitleComponent())
        tabHeaderContentBlock.appendChild(tab.getHeaderContentComponent())

        tabHeaderBlock.appendChild(tabHeaderTitleBlock)        
        tabHeaderBlock.appendChild(tabHeaderContentBlock)        
        
        this.tabRootComponent.appendChild(tabHeaderBlock)
        
        this.headerMap[tab.title] = tabHeaderBlock;
        this.contentMap[tab.title] = tab.getContentComponent();
        
        //Set click handler
        this.setClickHandler(tab)
        
        
        if(this.selectedTab == null) {
            this.select(tab)
        }
    
    }
    
    this.setClickHandler = function(tab) {
        var that = this;
        var  tabHeaderBlock = this.headerMap[tab.title]
        tabHeaderBlock.onclick = function() {
            that.select(tab)
        }
    }

    
    this.select = function(tab) {
         // Deselect previous element
         var previouslySelectedTab = this.selectedTab;
         if(previouslySelectedTab != null) {
             previouslySelectedTab.selected = false
             this.headerMap[previouslySelectedTab.title].setAttribute("class", "yack_unselected_tab_header");  
             this.setClickHandler(previouslySelectedTab)       
         }
         
         // Clean content panel
         while (this.contentRootComponent.hasChildNodes()) {
            this.contentRootComponent.removeChild(this.contentRootComponent.lastChild);
         }

         this.contentRootComponent.appendChild(this.contentMap[tab.title])
         var tabHeaderBlock =  this.headerMap[tab.title]
         tabHeaderBlock.setAttribute("class", "yack_selected_tab_header");
         tabHeaderBlock.onclick = null


         this.selectedTab = tab;
         tab.selected = true;
    
    }

    this.init();
}

function YackAuthComponent(rootComponent) {

    this.rootComponent = rootComponent;

    this.init = function() {
        this.generate()
        var self =  this;
        yack.core.loginEvent.register(function () { self.generate()})
    }

    this.onLogin = function() {
        return false;    
    }


    this.onLogout = function() {
        return false;    
    }
    
    this.generateDisconnectedState = function() {
        this.rootComponent.innerHTML = '<img id="browserid_button" alt="Sign in" src="https://browserid.org/i/sign_in_green.png" style="opacity: 1; cursor: pointer;">';
        var self = this;
    	document.getElementById('browserid_button').onclick = function() {
    		self.onUiLogin();
		}
    }
    
    this.generateConnectedState = function() {
    this.rootComponent.innerHTML = '<p>Logged as <em>'+this.userName+'</em></p>';
    }
    
    this.onUiLogin = function() {
    	var self = this;
		navigator.id.getVerifiedEmail(function(assertion) {
			    if (assertion) {
		            yack.core.loginByBrowserId(assertion);
			    } else {
			        // something went wrong!  the user isn't logged in.
			    }
			});
	}
	
	this.generate = function() {
	    if(yack.core.isLogged()) {
	        this.generateConnectedState()
	    } else {
	        this.generateDisconnectedState()
	    }
	}
    

    this.init();
}

function YackUploadTab() {

    this.init = function() {
        this.title = "upload"
        this.headerTitleComponent =  document.createElement('p');
        this.headerTitleComponent.innerHTML = "Upload";


        this.headerContentComponent =  document.createElement('div');
        
        this.contentComponent =  this.generateContent();
    }
    
    this.getContentComponent = function() {
        return this.contentComponent;    
    }
    
    this.getHeaderTitleComponent = function() {
        return this.headerTitleComponent;
    }
    
    this.getHeaderContentComponent = function() {
        return this.headerContentComponent;
    }
    
    this.generateContent = function() {
    
        var content = document.createElement('div');
        content.setAttribute("class", "upload_tab");
        
        // Quota bar
        var quotaBar = document.createElement('div');
        quotaBar.setAttribute("class", "quota_bar");
        quotaBar.appendChild(document.createTextNode("Quota"));
                
        // Title
        var title = document.createElement('h1');
        title.appendChild(document.createTextNode("Upload"));
        
        content.appendChild(quotaBar);
        content.appendChild(title);
        
        // Upload block
        var uploadBlock = document.createElement('div');
        uploadBlock.setAttribute("class", "upload_block");
        
            // Title
            var uploadBlockTitle = document.createElement('h2');
            uploadBlockTitle.appendChild(document.createTextNode("Select files to upload"));
            // SubBox
            var uploadBlockSubBox = document.createElement('div');
            uploadBlockSubBox.setAttribute("class", "upload_block_subbox");

                // FileChooser Block
                var fileChooserBlock = document.createElement('div');
                fileChooserBlock.setAttribute("class", "file_chooser_block");

                    // File Chooser
                    this.fileChooser = document.createElement('input');
                    this.fileChooser.setAttribute("type", "file");
                    this.fileChooser.setAttribute("multiple", "multiple");
                    var that = this;
                    this.fileChooser.onchange = function() { that.onUiFileInputChangeAction() };
                    
                    // Label
                    var fileChooserLabel = document.createElement('p');
                    fileChooserLabel.appendChild(document.createTextNode("You can select multiple files ..."));
                fileChooserBlock.appendChild(this.fileChooser);
                fileChooserBlock.appendChild(fileChooserLabel);
                    
                // DragDrop Block
                var dragDropBlock = document.createElement('div');
                dragDropBlock.setAttribute("class", "drag_drop_block");

                    // Image
                    var dragDropImage = document.createElement('img');
                    dragDropImage.setAttribute("src", "static/yack_drag_drop_75px.png");
                    
                    // Label
                    var dragDropLabel = document.createElement('p');
                    dragDropLabel.appendChild(document.createTextNode("... or drag them here."));
                    
                dragDropBlock.appendChild(dragDropImage);
                dragDropBlock.appendChild(dragDropLabel);
            uploadBlockSubBox.appendChild(fileChooserBlock);
            uploadBlockSubBox.appendChild(dragDropBlock);
            
                    
        uploadBlock.appendChild(uploadBlockTitle);
        uploadBlock.appendChild(uploadBlockSubBox);

        // Tasks block
        var tasksBlock = document.createElement('div');
        tasksBlock.setAttribute("class", "tasks_block");

            // Task list
            var tasksList = document.createElement('div');
            tasksList.setAttribute("class", "tasks_list");

            // Task controls
            var tasksControls = document.createElement('div');
            tasksControls.setAttribute("class", "tasks_controls");

                // Control buttons block
                var controlButtonsBlock = document.createElement('div');
                controlButtonsBlock.setAttribute("class", "control_buttons_block");

                    // pause all button
                    var pauseAllButton = document.createElement('a');
                    pauseAllButton.setAttribute("class", "inactive_button");
                    pauseAllButton.appendChild(document.createTextNode("pause all"));
                                        
                    // resume all button
                    var resumeAllButton = document.createElement('a');
                    resumeAllButton.setAttribute("class", "inactive_button");
                    resumeAllButton.appendChild(document.createTextNode("resume all"));

                controlButtonsBlock.appendChild(pauseAllButton);
                controlButtonsBlock.appendChild(resumeAllButton);   

                // Max upload chooser
                var maxUploadBlock = document.createElement('div');
                maxUploadBlock.setAttribute("class", "control_buttons_block");
                    // Label
                    var maxUploadLabel = document.createElement('label');
                    maxUploadLabel.setAttribute("for", "max_upload_chooser");
                    maxUploadLabel.appendChild(document.createTextNode("Max concurrent upload: "));
                    
                    // Input
                    var maxUploadInput = document.createElement('input');
                    maxUploadInput.setAttribute("type", "number");
                    maxUploadInput.setAttribute("name", "max_upload_chooser");
                    maxUploadInput.setAttribute("min", "1");
                    maxUploadInput.setAttribute("max", "100");
                    maxUploadInput.setAttribute("step", "1");
                    maxUploadInput.setAttribute("value", "5");

                maxUploadBlock.appendChild(maxUploadLabel);
                maxUploadBlock.appendChild(maxUploadInput);                                

                    
                // Interrupted files block
                var interruptedFilesBlock = document.createElement('div');
                interruptedFilesBlock.setAttribute("class", "interrupted_files_block");
                     // Interrupted files title
                     var interruptedFilesTitle = document.createElement('h2');
                     interruptedFilesTitle.appendChild(document.createTextNode("Interrupted files"));
                    
                     // Interrupted files list
                     var interruptedFilesList = document.createElement('div');
                    interruptedFilesList.setAttribute("class", "interrupted_files_list");
                
                     // Interrupted files label
                     var interruptedFilesLabel = document.createElement('p');
                     interruptedFilesLabel.appendChild(document.createTextNode("You must upload these files again to finish the transfer."));

                interruptedFilesBlock.appendChild(interruptedFilesTitle);                
                interruptedFilesBlock.appendChild(interruptedFilesList);
                interruptedFilesBlock.appendChild(interruptedFilesLabel);                                
                
            tasksControls.appendChild(controlButtonsBlock);
            tasksControls.appendChild(maxUploadBlock);
            tasksControls.appendChild(interruptedFilesBlock);
    
        tasksBlock.appendChild(tasksList);
        tasksBlock.appendChild(tasksControls);
           
        
        content.appendChild(quotaBar);
        content.appendChild(title);
        content.appendChild(uploadBlock);
        content.appendChild(tasksBlock);

        
        return content;
    }
    
    // Action
    this.onUiFileInputChangeAction = function() {
        
        var files = this.fileChooser.files;
        var filesStruct = [];
        
        for (var i = 0, file; file = files[i]; i++) {
            if(file.slice) {
                slice = file.slice(0,file.size);
            } else if(file.webkitSlice) {
                slice = file.webkitSlice(0,file.size);
            } else if(file.mozSlice) {
            	slice = file.mozSlice(0,file.size);
            } else {
                // Fail to find slice method
                alert("Your browser is too all : file.slice method is missing."); 
                return;
            }

 
           filesStruct[i] = {'name' : file.name , 'size' : file.size, 'blob' : slice}
        }
        
        yack.core.addFilesToUpload(filesStruct);
        
        this.fileChooser.value = ""
        
        return true;
    }
    
    
    this.init();
}

function YackFilesTab() {

    this.init = function() {
        this.title = "files"
        this.headerTitleComponent =  document.createElement('p');
        this.headerTitleComponent.innerHTML = "Files";


        this.headerContentComponent =  document.createElement('div');
        
        this.contentComponent =  document.createElement('div');
        this.contentComponent.innerHTML = "Files tab !"
    }
    
    this.getContentComponent = function() {
        return this.contentComponent;    
    }
    
    this.getHeaderTitleComponent = function() {
        return this.headerTitleComponent;
    }
    
    this.getHeaderContentComponent = function() {
        return this.headerContentComponent;
    }
    
    
    
    this.init();
}

function YackMoreTabsTab() {

    this.init = function() {
        this.title = "moretabs"
        this.headerTitleComponent =  document.createElement('p');
        this.headerTitleComponent.innerHTML = "More tabs";


        this.headerContentComponent =  document.createElement('div');
        
        this.contentComponent =  document.createElement('div');
        this.contentComponent.innerHTML = "More tabs !"
    }
    
    this.getContentComponent = function() {
        return this.contentComponent;    
    }
    
    this.getHeaderTitleComponent = function() {
        return this.headerTitleComponent;
    }
    
    this.getHeaderContentComponent = function() {
        return this.headerContentComponent;
    }
    
    this.init();
}

function YackSettingsTab() {

    this.init = function() {
        this.title = "settings"
        this.headerTitleComponent =  document.createElement('p');
        this.headerTitleComponent.innerHTML = "Settings";


        this.headerContentComponent =  document.createElement('div');
        
        this.contentComponent =  document.createElement('div');
        this.contentComponent.innerHTML = "Settings tab !"
    }
    
    this.getContentComponent = function() {
        return this.contentComponent;    
    }
    
    this.getHeaderTitleComponent = function() {
        return this.headerTitleComponent;
    }
    
    this.getHeaderContentComponent = function() {
        return this.headerContentComponent;
    }
    
    this.init();
}
