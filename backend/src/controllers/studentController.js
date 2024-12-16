import Student from "../models/student.js";
import Parent from "../models/parent.js";

// Add a Student
export const addStudent = async (req, res) => {
  const { name, class: studentClass, parent_id, notes } = req.body;

  try {
    const parent = await Parent.findById(parent_id);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    console.log(parent);

    const student = new Student({
      name,
      class: studentClass,
      parent_id,
      notes,
    });
    await student.save();

    console.log(student);

    // Optionally, update the parent's children_ids
    parent.children_ids.push(student._id);
    await parent.save();

    res.status(201).json({ message: "Student added successfully", student });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add student", error: error.message });
  }
};

// Get All Students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("parent_id", "name phone");
    res
      .status(200)
      .json({ message: "Students retrieved successfully", students });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message });
  }
};

// Get Student by ID
export const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate(
      "parent_id",
      "name phone"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res
      .status(200)
      .json({ message: "Student retrieved successfully", student });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch student", error: error.message });
  }
};

// Update Student
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    class: studentClass,
    parent_id,
    notes,
    accommodation,
  } = req.body;

  try {
    const student = await Student.findByIdAndUpdate(
      id,
      { name, class: studentClass, parent_id, notes, accommodation },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update student", error: error.message });
  }
};

// Delete Student
export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Optionally, remove the student ID from parent's children_ids
    const parent = await Parent.findById(student.parent_id);
    if (parent) {
      parent.children_ids = parent.children_ids.filter(
        (childId) => childId.toString() !== id
      );
      await parent.save();
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete student", error: error.message });
  }
};
