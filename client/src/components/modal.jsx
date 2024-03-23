import React, { useState } from 'react';

const Modal = ({ isOpen, onClose }) => {
    const [selectedOption1, setSelectedOption1] = useState('');
    const [selectedOption2, setSelectedOption2] = useState('');

    const handleOption1Change = (e) => {
        setSelectedOption1(e.target.value);
    };

    const handleOption2Change = (e) => {
        setSelectedOption2(e.target.value);
    };

    const handleSend = () => {
        onClose(); 
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="bg-white p-6 rounded-lg shadow-lg z-10">
                        <h2 className="text-lg font-semibold mb-4">Select Instructor</h2>
                        <div className="mb-4">
                            <label className="block mb-2">Professor</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={selectedOption1}
                                onChange={handleOption1Change}
                            >
                                <option value="">Select Option</option>
                                {/* Add options */}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Teacher Assistant</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={selectedOption2}
                                onChange={handleOption2Change}
                            >
                                <option value="">Select Option</option>
                                {/* Add options here */}
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                                onClick={handleSend}
                            >
                                Send
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;
