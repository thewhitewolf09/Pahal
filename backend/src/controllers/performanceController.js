import Performance from "../models/performance.js";

// Add Performance
export const addPerformance = async (req, res) => {
  const { student_id, marks } = req.body;


  const today = new Date();

  try {
    const performance = new Performance({
      student_id,
      test_date: today,
      marks,
    });


    
    await performance.save();
    res.status(201).json({
      message: "Performance added successfully",
      performance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add performance",
      error: error.message,
    });
  }
};

// Get All Performance Records
export const getAllPerformance = async (req, res) => {
  try {
    const performances = await Performance.find()
      .populate("student_id", "name class")
      .sort({ test_date: -1 }); // Sort by test date descending
    res.status(200).json({
      message: "Performance records fetched successfully",
      performances,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch performance records",
      error: error.message,
    });
  }
};

// Get Performance by Student ID
export const getPerformanceByStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const performance = await Performance.find({ student_id: studentId })
      .populate("student_id", "name class")
      .sort({ test_date: -1 }); // Sort by test date descending
    if (!performance) {
      return res.status(404).json({
        message: "No performance records found for this student",
      });
    }

    res.status(200).json({
      message: "Performance records retrieved successfully",
      performance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch performance records",
      error: error.message,
    });
  }
};

// Update Performance
export const updatePerformance = async (req, res) => {
  const { id } = req.params;
  const { marks } = req.body;

  try {
    const performance = await Performance.findByIdAndUpdate(
      id,
      { marks },
      { new: true }
    ).populate("student_id", "name class");

    if (!performance) {
      return res.status(404).json({
        message: "Performance record not found",
      });
    }

    res.status(200).json({
      message: "Performance updated successfully",
      performance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update performance",
      error: error.message,
    });
  }
};

// Delete Performance
export const deletePerformance = async (req, res) => {
  const { id } = req.params;

  try {
    const performance = await Performance.findByIdAndDelete(id);
    if (!performance) {
      return res.status(404).json({
        message: "Performance record not found",
      });
    }

    res.status(200).json({
      message: "Performance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete performance record",
      error: error.message,
    });
  }
};
