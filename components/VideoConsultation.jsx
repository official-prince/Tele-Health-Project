@@ .. @@
                <Input
                   placeholder="Type a message..."
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                   className="flex-1"
                 />
                 <Button size="sm" onClick={sendMessage}>
                   Send
                 </Button>
               </div>
+              
+              {/* File Upload for Medical Documents */}
+              <div className="pt-2 border-t">
+                <Button variant="outline" size="sm" className="w-full">
+                  <Share className="h-4 w-4 mr-2" />
+                  Share Medical Document
+                </Button>
+              </div>
             </CardContent>
           </Card>
         </div>