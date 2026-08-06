package com.eduai.backend_java.models;

import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String text;
    
    private String category;
    
    @Column(name = "question_type")
    private String type;

    // --- NEW FIELDS FOR CODING TEST CASES ---
    @Column(columnDefinition = "TEXT")
    private String testCaseInput;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;
    // ----------------------------------------

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    @Fetch(FetchMode.SUBSELECT) 
    private List<String> options;

    private String answer;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_starter_codes", joinColumns = @JoinColumn(name = "question_id"))
    @MapKeyColumn(name = "language")
    @Column(name = "code_snippet", columnDefinition="TEXT")
    @Fetch(FetchMode.SUBSELECT)
    private Map<String, String> starterCode;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTestCaseInput() { return testCaseInput; }
    public void setTestCaseInput(String testCaseInput) { this.testCaseInput = testCaseInput; }
    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public Map<String, String> getStarterCode() { return starterCode; }
    public void setStarterCode(Map<String, String> starterCode) { this.starterCode = starterCode; }
}