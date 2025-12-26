#include "PluginProcessor.h"
#include "PluginEditor.h"

SonaProcessor::SonaProcessor()
    : AudioProcessor(BusesProperties()
#if !JucePlugin_IsMidiEffect
        .withInput("Input", juce::AudioChannelSet::stereo(), true)
#endif
        .withOutput("Output", juce::AudioChannelSet::stereo(), true))
{
}

void SonaProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    juce::ignoreUnused(sampleRate, samplesPerBlock);
}

void SonaProcessor::releaseResources()
{
}

void SonaProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ignoreUnused(midiMessages);
    juce::ScopedNoDenormals noDenormals;
    
    auto totalNumInputChannels = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear(i, 0, buffer.getNumSamples());
}

juce::AudioProcessorEditor* SonaProcessor::createEditor()
{
    return new SonaEditor(*this);
}

const juce::String SonaProcessor::getName() const
{
    return JucePlugin_Name;
}

bool SonaProcessor::acceptsMidi() const
{
    return false;
}

bool SonaProcessor::producesMidi() const
{
    return false;
}

bool SonaProcessor::isMidiEffect() const
{
    return false;
}

double SonaProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

int SonaProcessor::getNumPrograms()
{
    return 1;
}

int SonaProcessor::getCurrentProgram()
{
    return 0;
}

void SonaProcessor::setCurrentProgram(int index)
{
    juce::ignoreUnused(index);
}

const juce::String SonaProcessor::getProgramName(int index)
{
    juce::ignoreUnused(index);
    return {};
}

void SonaProcessor::changeProgramName(int index, const juce::String& newName)
{
    juce::ignoreUnused(index, newName);
}

void SonaProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    juce::ignoreUnused(destData);
}

void SonaProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    juce::ignoreUnused(data, sizeInBytes);
}

bool SonaProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
        && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

    return true;
}

// Entry point
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new SonaProcessor();
}
