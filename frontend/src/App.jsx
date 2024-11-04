import { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
    const [apiCards, setApiCards] = useState([]); // State for public cards from API
    const [lockedCards, setLockedCards] = useState([]); // State for locked cards
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [marks, setMarks] = useState(0);
    const [isPublic, setIsPublic] = useState(true); // Default to public
    const [showToast, setShowToast] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    const fetchCards = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/cards');
            setApiCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    };

    const fetchMarks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/marks');
            if (response.data && response.data.value !== undefined) {
                setMarks(response.data.value);
            } else {
                setMarks(0);
            }
        } catch (error) {
            console.error('Error fetching marks:', error);
        }
    };

    const saveCard = async () => {
        const uploadDate = new Date().toLocaleString();
        const newCard = { title, description, uploadDate, isPublic };

        if (isPublic) {
            // Save to database if public
            try {
                const response = await axios.post('http://localhost:5000/api/cards', newCard);
                setApiCards([...apiCards, response.data]);
            } catch (error) {
                console.error('Error saving card:', error);
            }
        } else {
            // Save to local storage if locked
            const storedCards = JSON.parse(localStorage.getItem('lockedCards')) || [];
            storedCards.push(newCard);
            localStorage.setItem('lockedCards', JSON.stringify(storedCards));
            setLockedCards([...lockedCards, newCard]); // Update local state to include locked card
        }

        // Reset form fields
        setTitle('');
        setDescription('');
        setIsPublic(true); // Reset to default public
        fetchMarks(); // Refresh marks after saving a card
    };

    const loadLockedCards = () => {
        const storedCards = JSON.parse(localStorage.getItem('lockedCards')) || [];
        setLockedCards(storedCards);
    };

    const handleDelete = (cardId) => {
        setShowToast(true);
        setCardToDelete(cardId);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/cards/${cardToDelete}`);
            setApiCards(apiCards.filter(card => card._id !== cardToDelete));
            setShowToast(false);
            setCardToDelete(null);
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const cancelDelete = () => {
        setShowToast(false);
        setCardToDelete(null);
    };

    useEffect(() => {
        fetchCards();
        fetchMarks();
        loadLockedCards(); // Load locked cards from local storage on initial render
    }, []);


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center p-6 mx-auto">Improve Your English</h1>
            <div className="mb-4 flex gap-4">
                <input
                    required
                    className="border rounded-md px-3 py-2"
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    required
                    className="border rounded-md px-3 py-2"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex items-center">
                    <label className="mr-2">
                        <input
                            type="radio"
                            name="visibility"
                            value="public"
                            checked={isPublic}
                            onChange={() => setIsPublic(true)}
                        />
                        Public
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="visibility"
                            value="locked"
                            checked={!isPublic}
                            onChange={() => setIsPublic(false)}
                        />
                        Locked
                    </label>
                </div>
                <button
                    className="transition ease-in-out delay-150 bg-blue-500 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={saveCard}
                >
                    Add Paragraph
                </button>
            </div>
    
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Marks: {marks}</h2>
            </div>
    
            <div className='bg-slate-900 p-7 rounded-lg'>
                <h2 className="text-2xl text-teal-100 font-bold mb-4">Paragraphs</h2>
    
                <div className='bg-gray-200 rounded-lg p-4'>
                    {apiCards.length === 0 && lockedCards.length === 0 ? (
                        <p>No cards available.</p>
                    ) : (
                        [...apiCards, ...lockedCards].map(card => (
                            <div key={card.uploadDate} className="border-b border-gray-300 py-2">
                                <h3 className="font-bold">{card.title}</h3>
                                <p>{card.description}</p>
                                <p className="text-gray-500 text-sm">{card.uploadDate}</p>
                                <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(card._id || card.uploadDate)} // Use uploadDate for locked cards
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
    
            {showToast && (
                <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <p>Are you sure you want to delete this card?</p>
                    <div className="flex justify-end">
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                            onClick={confirmDelete}
                        >
                            Yes
                        </button>
                        <button
                            className="bg-gray-300 text-black px-4 py-2 rounded"
                            onClick={cancelDelete}
                        >
                            No
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;