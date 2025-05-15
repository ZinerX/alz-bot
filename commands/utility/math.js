import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import texsvg from 'texsvg';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { openai } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
    .setName('math')
    .setDescription('solve your math questions with llm')
    .addStringOption(option =>
        option
            .setName('question')
            .setDescription('your question regarding maths')
            .setRequired(true)
    )
    .addAttachmentOption(option =>
        option
            .setName('image')
            .setDescription('paste your question as an image if needed')
            .setRequired(false)
    )
export async function execute(interaction) {
    const question = interaction.options.getString('question');
    const image = interaction.options.getAttachment('image');
    let userContent;
    if (image) {
        userContent = [
            {
                type: "text",
                text: question,
            },
            {
                type: "image_url",
                image_url: {
                    url: image.url,
                }
            }
        ];
    } else {
        userContent = question;
    }
    let replyString;
    let filesToSend = [];
    try {
        await interaction.deferReply();
        const completion = await openai.chat.completions.create({
            model: "o4-mini",
            messages: [
                { role: "system", content: "You are an extremely helpful mathematics assistant." },
                { role: "system", content: "Please answer the given question in two steps." },
                { role: "system", content: "First, explain the steps to solve the question, limit it in 250 words and do not use mathematical equations or formula in this part. Feel free to use formats such as bold, italic and underline in markdown syntax." },
                { role: "system", content: "Then, for the formulae: present all steps as a single, continuous line of text. Each step must be a distinct LaTeX block (quoted with $$). If there are multiple steps, separate these LaTeX blocks ONLY with \' -::- \'. The entire single line, including all LaTeX blocks and separators, must be enclosed by a single \'|\' character at the very beginning and a single \'|\' character at the very end. Do not add any other text, explanations, or introductory/concluding sentences before, between, or after this single line block. For example: |$$step1$$ -::- $$step2$$ -::- $$final_answer$$|" },
                { role: "user", content: userContent }
            ],
        });

        if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
            const messageContent = completion.choices[0].message.content;
            replyString = messageContent;


            const formulaBlockRegex = /\|((?:\$\$[^$]+\$\$(?:\s*-\s*::\s*-\s*)?)+)\|/;
            const formulaBlockMatch = messageContent.match(formulaBlockRegex);

            if (formulaBlockMatch && formulaBlockMatch[1]) {
                const formulaBlockString = formulaBlockMatch[1];
                const splitFormulas = formulaBlockString.split(/\s*-\s*::\s*-\s*/);
                const tempDir = path.join(process.cwd(), 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }
                const imagePromises = splitFormulas.map(async (formula, index) => {
                    const latexMatch = formula.match(/\$\$(.*?)\$\$/s);
                    if (latexMatch && latexMatch[1]) {
                        const latexContent = latexMatch[1].trim();
                        
                        const outputPath = path.join(tempDir, `formula_${index}.png`);
                        
                        try {
                            const svg = await texsvg(latexContent);
                            
                            await sharp(Buffer.from(svg), { density: 300 })
                                .flatten({ background: { r: 255, g: 255, b: 255 } })
                                .extend({
                                    top: 20,
                                    bottom: 20,
                                    left: 20,
                                    right: 20,
                                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                                })
                                .toFile(outputPath);
                            
                            return {
                                path: outputPath,
                                success: true
                            };
                        } catch (err) {
                            console.error(`Error processing formula ${index + 1}:`, err);
                            return {
                                success: false
                            };
                        }
                    }
                    return { success: false };
                });

                const imageResults = await Promise.all(imagePromises);
                const successfulImages = imageResults.filter(result => result.success);
                
                if (successfulImages.length > 0) {
                    const metadataPromises = successfulImages.map(img => 
                        sharp(img.path).metadata()
                    );
                    const metadatas = await Promise.all(metadataPromises);
                    
                    const maxWidth = Math.max(...metadatas.map(m => m.width));
                    const totalHeight = metadatas.reduce((sum, m) => sum + m.height, 0);
                    
                    // Create the composite image
                    const compositeImage = await sharp({
                        create: {
                            width: maxWidth,
                            height: totalHeight,
                            channels: 4,
                            background: { r: 255, g: 255, b: 255, alpha: 1 }
                        }
                    }).composite(
                        successfulImages.map((img, i) => {
                            // Calculate Y position (vertically stacking images)
                            let yPosition = 0;
                            for (let j = 0; j < i; j++) {
                                yPosition += metadatas[j].height;
                            }
                            
                            return {
                                input: img.path,
                                gravity: 'northwest', // Align to top-left
                                top: yPosition,
                                left: 0
                            };
                        })
                    ).png().toBuffer();
                    
                    const finalImagePath = path.join(tempDir, 'combined_formulas.png');
                    await sharp(compositeImage).toFile(finalImagePath);
                    
                    const attachment = new AttachmentBuilder(finalImagePath);
                    filesToSend.push(attachment);
                    
                    replyString = messageContent.replace(formulaBlockRegex, "").trim();
                } else {
                    console.log("No formula images were successfully generated.");
                }

                setTimeout(() => {
                    try {
                        successfulImages.forEach(img => {
                            if (fs.existsSync(img.path)) {
                                fs.unlinkSync(img.path);
                            }
                        });
                        
                        const combinedPath = path.join(tempDir, 'combined_formulas.png');
                        if (fs.existsSync(combinedPath)) {
                            fs.unlinkSync(combinedPath);
                        }
                    } catch (err) {
                        console.error("Error cleaning up temporary files:", err);
                    }
                }, 5000);
            } else {
                console.log("No formula block matching the pattern '|$$...$$ -::- $$...$$|' was found in the AI response.");
            }
        } else {
            replyString = "Sorry, I couldn't get a response from the AI.";
        }
    } catch (error) {
        console.error("Error calling OpenAI:", error);
        replyString = "There was an error trying to communicate with the AI. Please try again later.";
    }

    await interaction.editReply({ content: replyString, files: filesToSend });
}


