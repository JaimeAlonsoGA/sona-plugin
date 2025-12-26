#pragma once

#include "PluginProcessor.h"
#include <juce_gui_extra/juce_gui_extra.h>

class SonaEditor : public juce::AudioProcessorEditor
{
public:
    explicit SonaEditor(SonaProcessor&);
    ~SonaEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    SonaProcessor& processorRef;
    
    // Función nativa para recibir mensajes desde JavaScript
    std::optional<juce::WebBrowserComponent::Resource> getResource(const juce::String& url);
    void handleMessageFromUI(const juce::var& message);
    void sendMessageToUI(const juce::String& messageJson);
    
    // WebView con opciones de JUCE 8
    juce::WebBrowserComponent webView {
        juce::WebBrowserComponent::Options{}
            .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
            .withWinWebView2Options(
                juce::WebBrowserComponent::Options::WinWebView2{}
                    .withUserDataFolder(juce::File::getSpecialLocation(
                        juce::File::tempDirectory).getChildFile("SonaWebView"))
            )
            .withNativeIntegrationEnabled()
            .withNativeFunction("sendToPlugin", [this](const juce::Array<juce::var>& args,
                                                        juce::WebBrowserComponent::NativeFunctionCompletion completion) {
                if (args.size() > 0 && args[0].isString())
                {
                    handleMessageFromUI(juce::JSON::parse(args[0].toString()));
                }
                completion({});
            })
            .withResourceProvider([this](const juce::String& url) { return getResource(url); },
                                  juce::String("http://sona.local"))
    };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(SonaEditor)
};
