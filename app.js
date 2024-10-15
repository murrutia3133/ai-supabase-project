// Initialize Supabase client
const supabaseUrl = 'https://jxlqhkuziytwalpvdivs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bHFoa3V6aXl0d2FscHZkaXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMjgzMzAsImV4cCI6MjA0NDYwNDMzMH0.WgnNxSXdc6qRALRVGDKFT2lsCEfh2VYlUTkQ7Ne8Xlk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI
const openai = new OpenAI({ apiKey: 'YOUR_OPENAI_API_KEY' });

async function getAIResponse() {
    const userInput = document.getElementById('userInput').value;
    const responseDiv = document.getElementById('response');

    try {
        // Get AI response
        const aiResponse = await openai.completions.create({
            model: "text-davinci-002",
            prompt: userInput,
            max_tokens: 150
        });

        const aiText = aiResponse.choices[0].text.trim();
        responseDiv.textContent = aiText;

        // Save response to Supabase
        const { data, error } = await supabase
            .from('ai_responses')
            .insert({ question: userInput, response: aiText });

        if (error) throw error;

        // Fetch and display previous responses
        await displayPreviousResponses();
    } catch (error) {
        console.error('Error:', error);
        responseDiv.textContent = 'An error occurred. Please try again.';
    }
}

async function displayPreviousResponses() {
    const { data, error } = await supabase
        .from('ai_responses')
        .select('question, response')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching previous responses:', error);
        return;
    }

    const previousResponsesList = document.getElementById('previousResponses');
    previousResponsesList.innerHTML = '';

    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `Q: ${item.question} - A: ${item.response}`;
        previousResponsesList.appendChild(li);
    });
}

// Initial load of previous responses
displayPreviousResponses();

