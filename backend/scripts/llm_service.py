from typing import Dict, Any, Optional, List, Union
import os
from dotenv import load_dotenv
import openai
from openai import OpenAI
import anthropic
from groq import Groq
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

class LLMProvider:
    """Base class for LLM providers"""
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def generate(self, 
                prompt: str, 
                model: str, 
                system_prompt: Optional[str] = None,
                temperature: float = 0.7,
                max_tokens: Optional[int] = None,
                **kwargs) -> str:
        raise NotImplementedError

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = OpenAI(api_key=api_key)
    
    def generate(self, 
                prompt: str, 
                model: str, 
                system_prompt: Optional[str] = None,
                temperature: float = 0.7,
                max_tokens: Optional[int] = None,
                **kwargs) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs
        )
        return response.choices[0].message.content.strip()

class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def generate(self, 
                prompt: str, 
                model: str, 
                system_prompt: Optional[str] = None,
                temperature: float = 0.7,
                max_tokens: Optional[int] = None,
                **kwargs) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = self.client.messages.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs
        )
        return response.content[0].text.strip()

class GroqProvider(LLMProvider):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = Groq(api_key=api_key)
    
    def generate(self, 
                prompt: str, 
                model: str, 
                system_prompt: Optional[str] = None,
                temperature: float = 0.7,
                max_tokens: Optional[int] = None,
                **kwargs) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs
        )
        return response.choices[0].message.content.strip()

class GoogleProvider(LLMProvider):
    def __init__(self, api_key: str):
        super().__init__(api_key)
        genai.configure(api_key=api_key)
        self.client = genai
    
    def generate(self, 
                prompt: str, 
                model: str, 
                system_prompt: Optional[str] = None,
                temperature: float = 0.7,
                max_tokens: Optional[int] = None,
                **kwargs) -> str:
        model = self.client.GenerativeModel(model)
        
        if system_prompt:
            prompt = f"{system_prompt}\n\n{prompt}"
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                **kwargs
            )
        )
        return response.text.strip()

def get_provider(provider_name: str, api_key: Optional[str] = None) -> LLMProvider:
    """
    Factory function to get the appropriate LLM provider.
    
    Args:
        provider_name: Name of the provider ('openai', 'anthropic', 'groq', 'google')
        api_key: API key for the provider. If None, will try to get from environment variables.
    
    Returns:
        An instance of the requested LLM provider.
    
    Raises:
        ValueError: If provider_name is not supported or api_key is missing.
    """
    if api_key is None:
        api_key = os.getenv(f"{provider_name.upper()}_API_KEY")
        if api_key is None:
            raise ValueError(f"API key not provided and {provider_name.upper()}_API_KEY not found in environment variables")
    
    providers = {
        'openai': OpenAIProvider,
        'anthropic': AnthropicProvider,
        'groq': GroqProvider,
        'google': GoogleProvider
    }
    
    if provider_name.lower() not in providers:
        raise ValueError(f"Unsupported provider: {provider_name}")
    
    return providers[provider_name.lower()](api_key)

def generate_text(
    prompt: str,
    provider: str = "openai",
    model: str = "gpt-4-turbo-preview",
    api_key: Optional[str] = None,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
    **kwargs
) -> str:
    """
    Generate text using the specified LLM provider.
    
    Args:
        prompt: The user's prompt
        provider: Name of the provider ('openai', 'anthropic', 'groq', 'google')
        model: Name of the model to use
        api_key: API key for the provider
        system_prompt: Optional system prompt to guide the model's behavior
        temperature: Controls randomness in the output (0.0 to 1.0)
        max_tokens: Maximum number of tokens to generate
        **kwargs: Additional provider-specific parameters
    
    Returns:
        Generated text from the LLM
    """
    provider_instance = get_provider(provider, api_key)
    return provider_instance.generate(
        prompt=prompt,
        model=model,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        **kwargs
    ) 