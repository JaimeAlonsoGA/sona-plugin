#include "PluginEditor.h"
#include <juce_core/juce_core.h>

SonaEditor::SonaEditor(SonaProcessor& p)
    : AudioProcessorEditor(&p), processorRef(p)
{
    addAndMakeVisible(webView);
    
    // En modo desarrollo, cargar desde Vite dev server
    // En producción, cargar desde recursos embebidos via resource provider
#if JUCE_DEBUG
    // Cargar desde servidor de desarrollo Vite
    webView.goToURL("http://localhost:5173");
#else
    // En producción, usar el resource provider con URL local
    webView.goToURL("http://sona.local/index.html");
#endif
    
    setSize(800, 600);
}

SonaEditor::~SonaEditor()
{
}

void SonaEditor::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
}

void SonaEditor::resized()
{
    webView.setBounds(getLocalBounds());
}

void SonaEditor::handleMessageFromUI(const juce::var& message)
{
    // Procesar mensajes recibidos desde JavaScript
    if (message.isObject())
    {
        auto type = message.getProperty("type", "").toString();
        auto payload = message.getProperty("payload", juce::var());
        
        DBG("Message from UI - Type: " + type);
        
        if (type == "ui-ready")
        {
            // La UI está lista, enviar estado inicial
            sendMessageToUI("{\"type\":\"connected\"}");
        }
        else if (type == "generate")
        {
            // Manejar solicitud de generación
            DBG("Generate request received");
        }
        // Agregar más handlers según sea necesario
    }
}

void SonaEditor::sendMessageToUI(const juce::String& messageJson)
{
    // Ejecutar JavaScript en el WebView para enviar mensaje a React
    auto script = "if(window.__onPluginMessage) window.__onPluginMessage('" + 
                  messageJson.replace("'", "\\'") + "');";
    webView.evaluateJavascript(script, nullptr);
}

std::optional<juce::WebBrowserComponent::Resource> SonaEditor::getResource(const juce::String& url)
{
    // Este método sirve archivos estáticos en producción
    // Por ahora retornamos nullopt para usar el servidor de desarrollo
    
    juce::ignoreUnused(url);
    
    // En producción, aquí cargarías los archivos desde BinaryData
    // Ejemplo:
    // if (url.endsWith("index.html"))
    // {
    //     return juce::WebBrowserComponent::Resource {
    //         std::vector<std::byte>(BinaryData::index_html, 
    //                                BinaryData::index_html + BinaryData::index_htmlSize),
    //         "text/html"
    //     };
    // }
    
    return std::nullopt;
}
