import { useState, useEffect } from "react";
import { View, TextInput } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const SearchInput = ({
  initialQuery,
  students = [],
  parents = [],
  setFilteredResults = () => {}, // Default empty function to prevent errors
  placeholder,
}) => {
  const [query, setQuery] = useState(initialQuery || "");

  // Debounced search function to avoid too many re-renders
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== "") {
        const searchQuery = query.toLowerCase();

        // Filter students based on name
        const filteredStudents = students.filter((student) =>
          student.name.toLowerCase().includes(searchQuery)
        );

        // Filter parents based on name
        const filteredParents = parents.filter((parent) =>
          parent.name.toLowerCase().includes(searchQuery)
        );

        // Combine filtered products and customers into a single result list
        setFilteredResults([...filteredStudents, ...filteredParents]);
      } else {
        // If query is empty, clear the results
        setFilteredResults([...students, ...parents]);
      }
    }, 300); // Debounce time of 300ms to delay the search

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount or query change
  }, [query, students, setFilteredResults]);

  return (
    <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 mb-3 bg-white rounded-2xl border-2 border-blue-600 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-gray flex-1 font-semibold font-pregular"
        value={query}
        placeholder={placeholder || "Search a Parents or Students"}
        placeholderTextColor="gray"
        onChangeText={(text) => setQuery(text)} // Update the query state
      />

      <Icon name="search" size={24} color="#1d4ed8" />
    </View>
  );
};

export default SearchInput;
