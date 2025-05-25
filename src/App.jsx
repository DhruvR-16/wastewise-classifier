import React, { useState, useEffect, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import './index.css'
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle, Info, Sparkles, Trash2, RotateCcw, FileText, Ratio, MessageSquareWarning, Send, Lightbulb } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 text-foreground flex flex-col items-center p-4 md:p-8 selection:bg-primary/20">
      <header className="w-full max-w-3xl text-center py-8 md:py-12">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-primary mr-3 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800">
            <span className="text-primary">WasteWise</span> Classifier
          </h1>
        </div>
        <p className="text-lg md:text-xl text-gray-600 mt-2">
            Snap or upload an image to identify waste and get smart recycling tips.
        </p>
      </header>

      <Card className="w-full max-w-xl shadow-2xl rounded-xl overflow-hidden bg-white/80 backdrop-blur-md border-gray-200/50">
        <CardHeader className="pt-8"> {/* Adjusted padding */}
          {/* Title and description moved to header */}
        </CardHeader>
        <CardContent className="space-y-8 p-6 md:p-8">
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
                <Label htmlFor="picture-upload" className="text-lg font-semibold text-gray-700 sr-only">
                  Upload Waste Image
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative group flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
                    ${isDragging ? 'border-primary bg-primary/10 scale-105' : imageSrc ? 'border-primary/60 bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-primary/5'}`}
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
                        <div className="text-xs text-muted-foreground mt-3 space-y-0.5 bg-slate-100 p-2 rounded-md border border-slate-200">
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
                      <UploadCloud className="h-16 w-16 text-gray-400 group-hover:text-primary transition-colors" />
                      <p className="text-lg font-medium text-gray-600 group-hover:text-primary transition-colors pointer-events-none">
                        <span className="font-semibold text-primary">Browse files</span> or drag & drop
                      </p>
                      <p className="text-sm text-gray-500">Supports: PNG, JPG, GIF (Max 10MB)</p>
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

          {result && !loading && (
            <div className="mt-8 w-full flex flex-col md:flex-row gap-6 items-start">
              {/* Left Card: Classification Results (Now a Card component) */}
              <Card className="flex-1 w-full border-primary/30 bg-primary/5 shadow-md rounded-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-primary flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                    Classification Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-base text-foreground/80">
                  <div>
                    <strong className="font-medium text-foreground">Identified as:</strong>{' '}
                    <span className="capitalize font-semibold text-primary">{result.className}</span>
                  </div>
                  <div>
                    <strong className="font-medium text-foreground">Confidence:</strong>{' '}
                    <span className="font-semibold text-primary">{result.confidence}%</span>
                  </div>
                  <div className="pt-2">
                    <strong className="font-medium text-foreground flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary/80" />
                      Recycling Tip:
                    </strong>
                    <p className="mt-1 pl-1 text-foreground/70">{result.tip}</p>
                  </div>
                  <p className="text-xs text-muted-foreground/70 pt-3 italic">
                    Disclaimer: AI-generated suggestion. Always verify with local recycling regulations.
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
                    <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3 p-4 border rounded-md bg-slate-50/80">
                      <Label htmlFor="userCorrection" className="font-semibold text-sm">What do you think this item is?</Label>
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
                </CardContent>
              </Card>

              {/* Right Card: Random Facts */}
              {currentFact && (
                <Card className="w-full md:w-2/5 lg:w-1/3 bg-white/70 backdrop-blur-sm border-yellow-400/50 shadow-lg rounded-lg self-stretch">
                  <CardHeader className="p-4 pb-2">
                    <strong className="font-medium text-foreground flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Did you know?
                    </strong>
                    <p className="mt-1 pl-1 text-sm text-foreground/70 italic">{currentFact}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-foreground/80 italic">
                    {currentFact}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground py-6 bg-slate-50/70 border-t border-gray-200/50">
            Powered by <strong className="text-primary/80">TensorFlow.js</strong> & <strong className="text-primary/80">MobileNet</strong>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
