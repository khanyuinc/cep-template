/**
 * Update the theme with the AppSkinInfo retrieved from the host product.
 */
function updateThemeWithAppSkinInfo(appSkinInfo) {
    //Update the background color of the panel
    var panelBackgroundColor = appSkinInfo.panelBackgroundColor.color;

    var adjusted = appSkinInfo.systemHighlightColor;

    // Hand adjustments for AE
    adjusted.red -= 163;
    adjusted.green *= .75;
    adjusted.blue *= .8;

    var systemHighlightColor = toHex(appSkinInfo.systemHighlightColor);
    var baseFontSize = appSkinInfo.baseFontSize-1;

    document.body.bgColor = toHex(panelBackgroundColor);
        
    var styleId = "ppstyle";
    
    var csInterface = new CSInterface();
	var appName = csInterface.hostEnvironment.appName;
    
    if(appName == "PHXS")
    {
	    addRule(styleId, "button, select, input[type=button], input[type=submit]", "border-radius:3px;");
	}

	if(appName == "PHXS" || appName == "AEFT" || appName == "PRLD") 
	{
	    var gradientBg = "background-image: -webkit-linear-gradient(top,  " + toHex(panelBackgroundColor, 40) + " , " + toHex(panelBackgroundColor, 10) + ");";
	    var gradientDisabledBg = "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 15) + " , " + toHex(panelBackgroundColor, 5) + ");";
	    var gradientBg = "background-image: -webkit-linear-gradient(top,  " + toHex(panelBackgroundColor, 40) + " , " + toHex(panelBackgroundColor, 10) + ");";
	    var gradientDisabledBg = "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 15) + " , " + toHex(panelBackgroundColor, 5) + ");";
	    var boxShadow = "-webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 1px rgba(0, 0, 0, 0.2);";
	    var boxActiveShadow = "-webkit-box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.6);";
	    
	    var isPanelThemeLight = panelBackgroundColor.red > 127;
	    var fontColor, disabledFontColor;
	    var borderColor;
	    var inputBackgroundColor;
	    var clickableColor;
	    var gradientHighlightBg;

	    if(isPanelThemeLight) 
	    {
	    	fontColor = toHex(panelBackgroundColor, -100);
	    	disabledFontColor = "color:" + toHex(panelBackgroundColor, -70) + ";";
	    	borderColor = "border-color: " + toHex(panelBackgroundColor, -90) + ";";
	    	inputBackgroundColor = "background-color: " + toHex(panelBackgroundColor, 54) + ";";
	    	gradientHighlightBg = "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -40) + " , " + toHex(panelBackgroundColor,-50) + ");";
	    } else {
	    	fontColor = toHex(panelBackgroundColor, 130);
	    	disabledFontColor = "color:" + toHex(panelBackgroundColor, 100) + ";";
	    	borderColor = "border-color: " + toHex(panelBackgroundColor, -45) + ";";
	    	inputBackgroundColor = "background-color: " + toHex(panelBackgroundColor, -10) + ";";
	    	gradientHighlightBg = "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -20) + " , " + toHex(panelBackgroundColor, -30) + ");";
	    }

	    clickableColor = "color: " + systemHighlightColor + ";";

	    addRule(styleId, "*", 
	    	"font-size:" + baseFontSize + "pt; " + 
	    	"color:" + fontColor + "; " + 
	    	"background-color:" + toHex(panelBackgroundColor) + ";"
	    );

	    addRule(styleId, "button, select, input[type=text], input[type=button], input[type=submit]", "color:" + fontColor + ";" + "font-size:" + (baseFontSize - .1) + "pt; ");
	    addRule(styleId, "button, select, input[type=text], input[type=button], input[type=submit]", "border: solid 1.5px #111;");    
	    addRule(styleId, "button, select, input[type=button], input[type=submit]", inputBackgroundColor);

	    addRule(styleId, ".slider-bar .strip", "background-color: " + toHex(panelBackgroundColor, -50) + ";");
	    addRule(styleId, ".slider-thumb", "background-color: " + toHex(panelBackgroundColor, 50) + ";");

	    addRule(styleId, "button.enabled:hover, input[type=button].enabled:hover, input[type=submit].enabled:hover", "background-color: #111;");
	    addRule(styleId, "button:active, input[type=button]:active, input[type=submit]:active", clickableColor + " border-bottom: solid 1px " + systemHighlightColor + ";");

	    addRule(styleId, "[disabled]", gradientDisabledBg);
	    addRule(styleId, "[disabled]", disabledFontColor);

	    addRule(styleId, "input[type=text]", inputBackgroundColor);
	    addRule(styleId, "input.clickable", clickableColor);
	}
}

function onAppThemeColorChanged(event) {
    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    updateThemeWithAppSkinInfo(skinInfo);
} 

function addRule(stylesheetId, selector, rule) {
    var stylesheet = document.getElementById(stylesheetId);
    
    if (stylesheet) {
        stylesheet = stylesheet.sheet;
           if( stylesheet.addRule ){
               stylesheet.addRule(selector, rule);
           } else if( stylesheet.insertRule ){
               stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
           }
    }
}


function reverseColor(color, delta) {
    return toHex({red:Math.abs(255-color.red), green:Math.abs(255-color.green), blue:Math.abs(255-color.blue)}, delta);
}

/**
 * Convert the Color object to string in hexadecimal format;
 */
function toHex(color, delta) {
    function computeValue(value, delta) {
        var computedValue = !isNaN(delta) ? value + delta : value;
        if (computedValue < 0) {
            computedValue = 0;
        } else if (computedValue > 255) {
            computedValue = 255;
        }

        computedValue = Math.round(computedValue).toString(16);
        return computedValue.length == 1 ? "0" + computedValue : computedValue;
    }

    var hex = "";
    if (color) {
        with (color) {
             hex = computeValue(red, delta) + computeValue(green, delta) + computeValue(blue, delta);
        };
    }
    return "#" + hex;
}

function listenForThemeUpdates()
{
    updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
}