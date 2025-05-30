import React, { useState, useEffect, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import './index.css'
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle, Info, Sparkles, Trash2, RotateCcw, FileText, Ratio, MessageSquareWarning, Send, Lightbulb, Github } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function App() {
  const [model, setModel] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const imageRef = useRef(null);
  const [imageDetails, setImageDetails] = useState(null); // { name, size, type, dimensions }
  const [isDragging, setIsDragging] = useState(false);

  // New Features State
  const [currentFact, setCurrentFact] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [userCorrection, setUserCorrection] = useState("");

  useEffect(() => {
    async function loadModel() {
      try {
        console.log("Loading model...");
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        console.log("Model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
        // Handle model loading error (e.g., show an error message to the user)
      } finally {
        setLoadingModel(false);
      }
    }
    loadModel();
  }, []);

  const processFile = (file) => {
    if (!file) return;

    // Optional: Add file type/size validation here
    // if (!file.type.startsWith('image/')) { ... }
    // if (file.size > 10 * 1024 * 1024) { ... } // 10MB limit

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setResult(null); // Clear previous results when a new image is uploaded
    setCurrentFact(""); // Clear previous fact

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageDetails({
        name: file.name,
        size: (file.size / 1024).toFixed(2), // size in KB
        type: file.type,
        dimensions: `${img.width} x ${img.height} px`,
      });
    };
    img.src = URL.createObjectURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    // Reset file input to allow uploading the same file again if needed
    if (e.target) e.target.value = null;
  };
  
  const factsArray = [
    "Recycling one aluminum can save enough energy to run a TV for 3 hours.",
    "Glass can be recycled endlessly without losing quality or purity.",
    "Around 8 million metric tons of plastic are dumped into our oceans every year.",
    "Composting food scraps can reduce landfill waste by up to 30%.",
    "Recycling paper saves trees and reduces greenhouse gas emissions.",
    "The average person generates over 4 pounds of trash every day.",
    "E-waste contains valuable materials like gold and silver that can be recovered through recycling.",
    "Plastic bags can take up to 1,000 years to decompose in landfills.",
  ];

  const getRandomFact = () => {
    return factsArray[Math.floor(Math.random() * factsArray.length)];
  };

  const classifyImage = async () => {
    if (!model || !imageRef.current) return;

    setLoading(true);
    setResult(null);

    try {
      const predictions = await model.classify(imageRef.current);
      console.log("Predictions:", predictions);

      if (predictions && predictions.length > 0) {
        const top = predictions[0];
        const className = top.className.toLowerCase();
        const confidence = (top.probability * 100).toFixed(2);
        
        let tip = "Please refer to local recycling guidelines.";

        if (className.includes("bottle") || className.includes("plastic")) {
          tip = "Plastic bottles are often recyclable. Empty, rinse, and remove caps (check local rules if caps should be on or off).";
        } else if (className.includes("can") || className.includes("aluminum") || className.includes("tin")) {
          tip = "Metal cans are usually recyclable. Empty and rinse them before placing in the recycling bin.";
        } else if (className.includes("paper") || className.includes("cardboard")) {
          tip = "Clean paper and cardboard are widely recyclable. Flatten boxes. Avoid soiled paper (e.g., greasy pizza boxes).";
        } else if (className.includes("glass")) {
          tip = "Glass bottles and jars are recyclable. Rinse them and check if your local facility requires sorting by color.";
        } else if (className.includes("organic") || className.includes("food") || className.includes("compost")) {
          tip = "Organic waste like fruit peels or vegetable scraps can often be composted. Check for local composting programs.";
        }

        const classificationResult = { className: top.className.split(',')[0], confidence, tip };
        setResult(classificationResult);
        setCurrentFact(getRandomFact());

      } else {
        setResult({ className: "Unknown", confidence: "N/A", tip: "Could not classify the image. Please try a clearer image or a different item." });
        setCurrentFact("");
      }
    } catch (error) {
      console.error("Error classifying image:", error);
      setResult({ className: "Error", confidence: "N/A", tip: "An error occurred during classification." });
      setCurrentFact("");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
    // Clear the dataTransfer object
    if (e.dataTransfer.items) e.dataTransfer.items.clear(); else e.dataTransfer.clearData();
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!userCorrection.trim() || !result) return;
    console.log("Feedback Submitted:", {
      originalImage: imageSrc ? imageSrc.substring(0, 50) + "..." : "N/A", // Log snippet
      aiClassification: result.className,
      userCorrection: userCorrection,
    });
    // Here you would typically send this data to a backend
    setShowFeedbackForm(false);
    setUserCorrection("");
    // Optionally, update history item with user feedback
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-fuchsia-100 to-rose-100 text-slate-700 flex flex-col items-center p-4 md:p-8 selection:bg-primary/20">
      <header className="w-full max-w-3xl text-center py-8 md:py-12">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-primary mr-3 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800">
            <span className="text-primary">WasteWise</span> Classifier
          </h1>
        </div>
        <p className="text-lg md:text-xl text-slate-600 mt-2 max-w-2xl mx-auto">
            Wondering how to dispose of an item? Upload its image, and our AI will classify it and provide recycling tips!
        </p>
      </header>

      <main className={`w-full mx-auto flex flex-col gap-6 px-4 md:px-0 ${
        result && !loading 
          ? 'max-w-6xl lg:flex-row items-start' 
          : 'max-w-xl items-center' 
      }`}>
        {/* Left Column: Image Upload Card */}
        <Card className={`w-full shadow-xl rounded-xl overflow-hidden bg-white/75 backdrop-blur-lg border-gray-200/50 ${
          result && !loading ? 'lg:w-3/5' : ''
        }`}>
          <CardContent className="p-6 md:p-8 space-y-6">
            {loadingModel ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-xl font-medium text-muted-foreground">Warming up the AI...</p>
                <p className="text-sm text-muted-foreground/80">This might take a few moments.</p>
                <Progress value={60} className="w-full max-w-xs mt-3 h-2.5" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <Label htmlFor="picture-upload" className="text-lg font-semibold text-slate-700 sr-only">
                    Upload Waste Image
                  </Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative group flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
                      ${isDragging ? 'border-primary bg-primary/10 scale-105' : imageSrc ? 'border-primary/60 bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-primary/5'}`}
                  >
                    <input
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading || loadingModel}
                    />
                    {imageSrc ? (
                      <div className="text-center w-full space-y-4">
                        <img
                          ref={imageRef}
                          src={imageSrc}
                          alt="Preview"
                          className="max-w-full max-h-60 md:max-h-72 object-contain rounded-lg mx-auto shadow-md border border-gray-200"
                        />
                        {imageDetails && (
                          <div className="text-xs text-slate-600 mt-3 space-y-0.5 bg-primary/5 p-2.5 rounded-lg border border-primary/20">
                            <p className="flex items-center"><FileText className="h-3.5 w-3.5 mr-1.5 text-primary/70" /> {imageDetails.name} ({imageDetails.size} KB)</p>
                            <p className="flex items-center"><Ratio className="h-3.5 w-3.5 mr-1.5 text-primary/70" /> Dimensions: {imageDetails.dimensions}</p>
                          </div>
                        )}
                        <div className="flex justify-center items-center gap-2 sm:gap-3 mt-3">
                          <Button asChild variant="outline" size="lg" disabled={loading} className="group/btn">
                            <Label htmlFor="picture-upload" className="cursor-pointer flex items-center">
                              <RotateCcw className="mr-2 h-5 w-5 transition-transform group-hover/btn:rotate-[-90deg]" /> Change Image
                            </Label>
                          </Button>
                          <Button variant="ghost" size="lg" onClick={() => { 
                            setImageSrc(null); 
                            setResult(null); 
                            setImageDetails(null);
                            setCurrentFact("");
                            setShowFeedbackForm(false);
                            setUserCorrection("");
                            if(imageRef.current) imageRef.current.src = ''; 
                          }} disabled={loading} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-2 h-5 w-5" /> Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Label
                        htmlFor="picture-upload"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-center p-6 space-y-2"
                      >
                        <UploadCloud className="h-12 w-12 md:h-16 md:w-16 text-gray-400 group-hover:text-primary transition-colors" />
                        <p className="text-xl font-semibold text-slate-700 mt-3 mb-1">Upload Your Waste Image Here</p>
                        <p className="text-md text-slate-600 group-hover:text-primary transition-colors pointer-events-none">
                          <span className="font-semibold text-primary">Click to browse</span> or drag & drop an image.
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Our AI will then classify it for you!</p>
                        <p className="text-xs text-slate-400 mt-1">Supports: PNG, JPG, GIF (Max 10MB)</p>
                      </Label>
                    )}
                  </div>
                </div>

                {imageSrc && (
                  <Button
                    onClick={classifyImage}
                    disabled={loading || !imageSrc || loadingModel}
                    className="w-full text-xl py-7 rounded-lg shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Classifying...
                      </>
                    ) : (
                      "✨ Classify My Waste!"
                    )}
                  </Button>
                )}

                {loading && <Progress value={loading ? 75 : 0} className="w-full h-2.5 animate-pulse" />}
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Results and Facts - only shows if there's a result and not loading */}
        {result && !loading && (
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            {/* Classification Result */}
            <Alert className="w-full border-primary/30 bg-primary/5 shadow-md rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <AlertTitle className="text-xl font-semibold text-primary mb-3">Classification Complete!</AlertTitle>
              <AlertDescription className="space-y-3 text-base text-slate-700/90">
                  <div>
                    <strong className="font-medium text-slate-700">Identified as:</strong>{' '}
                    <span className="capitalize font-semibold text-primary">{result.className}</span>
                  </div>
                  <div>
                    <strong className="font-medium text-slate-700">Confidence:</strong>{' '}
                    <span className="font-semibold text-primary">{result.confidence}%</span>
                  </div>
                  <div className="pt-2">
                    <strong className="font-medium text-slate-700 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary/80" />
                      Recycling Tip:
                    </strong>
                    <p className="mt-1 pl-1 text-slate-600/90">{result.tip}</p>
                  </div>
                  <p className="text-sm text-red-600 pt-3 italic">
                    <strong className="font-semibold text-red-700">Disclaimer:</strong> AI-generated suggestion. Always verify with local recycling regulations.
                  </p>
                  {!showFeedbackForm && (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto" onClick={() => setShowFeedbackForm(true)}>
                            <MessageSquareWarning className="mr-2 h-4 w-4" /> Report Misclassification
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Help improve our AI if the classification seems incorrect.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {showFeedbackForm && (
                    <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3 p-4 border border-green-200/80 rounded-md bg-green-50/85">
                      <Label htmlFor="userCorrection" className="font-semibold text-sm text-slate-700">What do you think this item is?</Label>
                      <input
                        id="userCorrection"
                        type="text"
                        value={userCorrection}
                        onChange={(e) => setUserCorrection(e.target.value)}
                        placeholder="e.g., Plastic Lid, Cardboard Box"
                        className="w-full p-2 border rounded-md text-sm focus:ring-primary focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm"><Send className="mr-2 h-4 w-4" /> Submit Feedback</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => {setShowFeedbackForm(false); setUserCorrection("");}}>Cancel</Button>
                      </div>
                    </form>
                  )}
              </AlertDescription>
            </Alert>

            {/* Fact Card */}
            {currentFact && (
              <Card className="w-full bg-amber-50/85 backdrop-blur-md border border-amber-300/80 shadow-lg rounded-lg">
                <CardHeader className="p-4 pb-2">
                  <strong className="font-medium text-amber-700 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                    Did you know?
                  </strong>
                  <p className="mt-1 pl-1 text-sm text-amber-600/90 italic">{currentFact}</p>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-4 right-4 z-50">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-slate-700/80 hover:bg-slate-800/90 backdrop-blur-md shadow-lg border border-slate-600/50 rounded-full px-3 py-1.5 transition-colors cursor-pointer">
                <a href="https://github.com/DhruvR-16/wastewise-classifier" target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-slate-200 hover:text-white">
                  <Github className="h-4 w-4 mr-1.5" />
                  View on GitHub
                </a>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="end" className="bg-slate-800 text-white text-xs rounded-md px-2 py-1 shadow-lg">
              <p>Access Waste Classifier Model</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </footer>

    </div>
  );
}

export default App;
