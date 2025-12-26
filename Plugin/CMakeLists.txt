project(Sona VERSION 1.0.0)

set(TargetName ${PROJECT_NAME})

# Fetch WebView2 SDK for Windows
if(WIN32)
    include(FetchContent)
    FetchContent_Declare(
        webview2
        URL https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2210.55
        DOWNLOAD_EXTRACT_TIMESTAMP TRUE
    )
    FetchContent_MakeAvailable(webview2)
    
    set(WEBVIEW2_INCLUDE_DIR "${webview2_SOURCE_DIR}/build/native/include")
    set(WEBVIEW2_LIB_DIR "${webview2_SOURCE_DIR}/build/native/x64")
endif()

juce_add_plugin("${TargetName}"
    COMPANY_NAME "YourCompany"              # Cambiar
    PLUGIN_MANUFACTURER_CODE Sona           # 4 caracteres únicos
    PLUGIN_CODE Sona                        # 4 caracteres únicos
    FORMATS VST3 Standalone AU
    PRODUCT_NAME "Sona"
    
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD FALSE
    
    # WebView options
    VST3_CATEGORIES "Fx" "Generator"
)

# Source files
target_sources(${TargetName} PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginProcessor.h
    Source/PluginEditor.cpp
    Source/PluginEditor.h
)

# Compile definitions
target_compile_definitions(${TargetName}
    PUBLIC
        JUCE_WEB_BROWSER=1                      # Enable WebView
        JUCE_USE_CURL=1                         # Enable HTTP requests
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_DISPLAY_SPLASH_SCREEN=0
        JUCE_MODAL_LOOPS_PERMITTED=1
        
        # Windows WebView2
        JUCE_USE_WIN_WEBVIEW2_WITH_STATIC_LINKING=1
)

# Link libraries
target_link_libraries(${TargetName}
    PRIVATE
        juce::juce_audio_utils
        juce::juce_gui_extra                    # Para WebBrowserComponent
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# WebView2 include directories for Windows
if(WIN32)
    target_include_directories(${TargetName} PRIVATE ${WEBVIEW2_INCLUDE_DIR})
    target_link_libraries(${TargetName} PRIVATE "${WEBVIEW2_LIB_DIR}/WebView2LoaderStatic.lib")
endif()
