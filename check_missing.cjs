const fs = require('fs');

const rawList = `
.EPUB
Electronic Publication

.HTML
Hypertext Markup Language

.TYP
Typst

.ADOC
modern AsciiDoc

.BIB
BibLaTeX bibliography

.BIB
BibTeX bibliography

.BITS
BITS XML, alias for jats

.MD
CommonMark Markdown

.MD
CommonMark with extensions

.CREOLE
Creole 1.0

.CSV
Comma Separated Values

.DJ
Djot markup

.DOCX
WordprocessingML Document

.DOKUWIKI
DokuWiki markup

.ENDNOTEXML
EndNote XML bibliography

.FB2
FictionBook2

.MD
GitHub-Flavored Markdown

.HADDOCK
Haddock markup

.IPYNB
Jupyter notebook

.JIRA
Jira/Confluence wiki markup

.TEX
LaTeX

.1
roff man

.MD
Pandoc's Markdown

.MD
GitHub-Flavored Markdown

.MD
MultiMarkdown

.MD
PHP Markdown Extra

.MD
original unextended Markdown

.MDOC
mdoc manual page markup

.WIKI
MediaWiki markup

.MUSE
Muse

.NATIVE
native Haskell

.ODT
OpenDocument Text

.OPML
OPML

.ORG
Emacs Org mode

.POD
Perl POD

.PPTX
PresentationML Presentation

.RIS
RIS bibliography

.RST
reStructuredText

.RTF
Rich Text Format

.T2T
txt2tags

.TEXTILE
Textile

.TIKIWIKI
TikiWiki markup

.TSV
TSV table

.TWIKI
TWiki markup

.VIMWIKI
Vimwiki

.XLSX
SpreadsheetML Workbook

.JSON
CSL JSON bibliography

.XML
DocBook v4

.XML
JATS XML

.JSON
JavaScript Object Notation

.XML
Extensible Markup Language

.SVG
Scalable Vector Graphics

.PNG
Portable Network Graphics

.JPG
Joint Photographic Experts Group JFIF

.WEBP
WebP

.GIF
CompuServe Graphics Interchange Format (GIF)

.TXT
Plain Text

.XML
Android Vector Drawable

.WAV
Waveform Audio File Format

.MP4
MPEG-4 Part 14

.MP3
MP3 Audio

.MOV
QuickTime / MOV

.MKV
Matroska / WebM

.WEBM
Matroska / WebM / webm

.OGG
Ogg Audio

.FLAC
Free Lossless Audio Codec

.AAC
raw ADTS AAC (Advanced Audio Coding)

.TS
MPEG-TS (MPEG-2 Transport Stream)

.ASE
Aseprite Sprite Format

.ASEPRITE
Aseprite Sprite Format

.AVIF
AV1 Image File Format

.BMP
Microsoft Windows bitmap image

.BMP2
Microsoft Windows bitmap image (V2)

.BMP3
Microsoft Windows bitmap image (V3)

.DCM
Digital Imaging and Communications in Medicine image

.DCR
Kodak Digital Camera Raw Format

.DDS
Microsoft DirectDraw Surface

.DNG
Digital Negative Raw Format

.DPX
SMPTE 268M-2003 (DPX 2.0)

.EPI
Encapsulated PostScript Interchange format

.EPS
Encapsulated PostScript

.EPSF
Encapsulated PostScript

.EPSI
Encapsulated PostScript Interchange format

.EXR
High Dynamic-range (HDR)

.FITS
Flexible Image Transport System

.G3
Group 3 FAX

.GIF87
CompuServe Graphics Interchange Format (GIF)

.GROUP4
Raw CCITT Group4

.HEIC
High Efficiency Image Format

.HEIF
High Efficiency Image Format

.ICO
Microsoft Windows ICO

.J2C
JPEG-2000 Code Stream Syntax

.J2K
JPEG-2000 Code Stream Syntax

.JNG
JPEG Network Graphics

.JP2
JPEG-2000 File Format Syntax

.JPC
JPEG-2000 Code Stream Syntax

.JPE
Joint Photographic Experts Group JFIF

.JPM
JPEG-2000 File Format Syntax

.JPS
Joint Photographic Experts Group JFIF

.JPT
JPEG-2000 File Format Syntax

.JXL
JPEG XL (ISO/IEC 18181)

.MPC
Magick Pixel Cache image format

.MPO
Multi-Picture Object

.MSL
Magick Scripting Language

.PAM
Common 2-dimensional bitmap format

.PBM
Portable bitmap format (black and white)

.PCL
Printer Control Language

.PCT
Apple Macintosh QuickDraw/PICT

.PCX
ZSoft IBM PC Paintbrush

.PDB
Palm Database ImageViewer Format

.PFA
Postscript Type 1 font (ASCII)

.PFB
Postscript Type 1 font (binary)

.PFM
Portable float format

.PGM
Portable graymap format (gray scale)

.PJPEG
Joint Photographic Experts Group JFIF

.PNG00
PNG inheriting bit-depth, color-type from original, if possible

.PNG24
opaque or binary transparent 24-bit RGB

.PNG32
opaque or transparent 32-bit RGBA

.PNG48
opaque or binary transparent 48-bit RGB

.PNG64
opaque or transparent 64-bit RGBA

.PNG8
8-bit indexed with optional binary transparency

.PNM
Portable anymap

.PPM
Portable pixmap format (color)

.PS
PostScript

.PSB
Adobe Large Document Format

.PSD
Adobe Photoshop bitmap

.PTIF
Pyramid encoded TIFF

.RAS
SUN Rasterfile

.RGB
Raw red, green, and blue samples

.SF3
Simple File Format Family Images

.SGI
Irix RGB image

.STI
Sinar CaptureShop Raw Format

.SVGZ
Compressed Scalable Vector Graphics

.TGA
Truevision Targa image

.TIFF
Tagged Image File Format

.TIFF64
Tagged Image File Format (64-bit)

.TTC
TrueType font collection

.VST
Microsoft Visio Template

.WBINFO
Amiga Workbench Icon

.WBMP
Wireless Bitmap (level 0) image

.XBM
X Windows system bitmap (black and white)

.XPM
X Windows system pixmap (color)

.XPS
Microsoft XML Paper Specification

.ANI
Microsoft Windows ANI

.CUR
Microsoft Windows CUR

.LEVEL
Pâquerette: Down the Bunburrows Level File

.RGBA
Raw red, green, blue, and alpha samples

.ZIP
ZIP Archive

.CBZ
Comic Book Archive (ZIP)

.TAR
Tape Archive

.CBT
Comic Book Archive (TAR)

.3DOSTR
3DO STR

.4XM
4X Technologies

.AA
Audible AA format files

.AAX
CRI AAX

.AC3
raw AC-3

.AC4
raw AC-4

.ACE
tri-Ace Audio Container

.ACM
Interplay ACM

.ACT
ACT Voice file format

.ADF
Artworx Data Format

.ADP
ADP

.ADS
Sony PS2 ADS

.ADX
CRI ADX

.AEA
MD STUDIO audio

.AFC
AFC

.AIF
Audio IFF

.AIX
CRI AIX

.ALAW
PCM A-law

.ALIAS_PIX
Alias/Wavefront PIX image

.ALP
LEGO Racers ALP

.AMR
3GPP AMR

.AMRNB
raw AMR-NB

.AMRWB
raw AMR-WB

.ANM
Deluxe Paint Animation

.APAC
raw APAC

.APC
CRYO APC

.APE
Monkey's Audio

.APM
Ubisoft Rayman 2 APM

.APNG
Animated Portable Network Graphics

.APTX
raw aptX (Audio Processing Technology for Bluetooth)

.APTX_HD
raw aptX HD (Audio Processing Technology for Bluetooth)

.APV
APV raw bitstream

.ARGO_ASF
Argonaut Games ASF

.ARGO_BRP
Argonaut Games BRP

.ARGO_CVG
Argonaut Games CVG

.ASF
Windows Media Video (WMV)

.ASF_O
ASF (Advanced / Active Streaming Format)

.AST
AST (Audio Stream)

.AU
Sun AU

.AV1
AV1 Annex B

.AVI
AVI (Audio Video Interleaved)

.AVR
AVR (Audio Visual Research)

.AVS
Argonaut Games Creature Shock

.AVS2
raw AVS2-P2/IEEE1857.4 video

.AVS3
AVS3-P2/IEEE1857.10

.BETHSOFTVID
Bethesda Softworks VID

.BFI
Brute Force & Ignorance

.BFSTM
BFSTM (Binary Cafe Stream)

.BIN
Binary text

.BIK
Bink Video

.BINKA
Bink Audio

.BIT
G.729 BIT file format

.BITPACKED
Bitpacked

.BMV
Discworld II BMV

.BOA
Black Ops Audio

.BONK
raw Bonk

.BRENDER_PIX
BRender PIX image

.BRSTM
BRSTM (Binary Revolution Stream)

.C93
Interplay C93

.CAF
Apple CAF (Core Audio Format)

.CAVSVIDEO
raw Chinese AVS (Audio Video Standard) video

.CDG
CD Graphics

.CDXL
Commodore CDXL video

.CINE
Phantom Cine

.CODEC2
codec2 .c2 muxer

.CODEC2RAW
raw codec2 muxer

.CONCAT
Virtual concatenation script

.DATA
raw data

.DAUD
D-Cinema audio

.DCSTR
Sega DC STR

.DERF
Xilam DERF

.DFA
Chronomaster DFA

.DFPWM
raw DFPWM1a

.DHAV
Video DAV

.DIRAC
raw Dirac

.DNXHD
raw DNxHD (SMPTE VC-3)

.DSF
DSD Stream File (DSF)

.DSICIN
Delphine Software International CIN

.DSS
Digital Speech Standard (DSS)

.DTS
raw DTS

.DTSHD
raw DTS-HD

.DV
DV (Digital Video)

.DVBSUB
raw dvbsub

.DVBTXT
dvbtxt

.DXA
DXA

.EA
Electronic Arts Multimedia

.EA_CDATA
Electronic Arts cdata

.EAC3
raw E-AC-3

.EPAF
Ensoniq Paris Audio File

.EVC
raw EVC video

.F32BE
PCM 32-bit floating-point big-endian

.F32LE
PCM 32-bit floating-point little-endian

.F64BE
PCM 64-bit floating-point big-endian

.F64LE
PCM 64-bit floating-point little-endian

.FFMETADATA
FFmpeg metadata in text

.FILM_CPK
Sega FILM / CPK

.FILMSTRIP
Adobe Filmstrip

.FLIC
FLI/FLC/FLX animation

.FLV
FLV (Flash Video)

.FRM
Megalux Frame

.FSB
FMOD Sample Bank

.FWSE
Capcom's MT Framework sound

.G722
raw G.722

.TCO
raw G.723.1

.G726
raw big-endian G.726 ("left-justified")

.G726LE
raw little-endian G.726 ("right-justified")

.G728
raw G.728

.G729
G.729 raw format demuxer

.GDV
Gremlin Digital Video

.GENH
GENeric Header

.GSM
raw GSM

.GXF
GXF (General eXchange Format)

.H261
raw H.261

.H263
raw H.263

.H264
raw H.264 video

.HCA
CRI HCA

.HCOM
Macintosh HCOM

.HEVC
raw HEVC video

.HLS
Apple HTTP Live Streaming

.HNM
Cryo HNM v4

.HXVS
HXVF/HXVS IP camera format

.IAMF
Raw Immersive Audio Model and Formats

.IDCIN
id Cinematic

.IDF
iCE Draw File

.IFF
IFF (Interchange File Format)

.IFV
IFV CCTV DVR

.LBC
iLBC storage

.IMAGE2
image2 sequence

.INGENIENT
raw Ingenient MJPEG

.IPMOVIE
Interplay MVE

.IPU
raw IPU Video

.IRCAM
Berkeley/IRCAM/CARL Sound Format

.ISS
Funcom ISS

.IV8
IndigoVision 8000 video

.IVF
On2 IVF

.IVR
IVR (Internet Video Recording)

.JPEGXL_ANIM
Animated JPEG XL

.JV
Bitmap Brothers JV

.KUX
KUX (YouKu)

.KVAG
Simon & Schuster Interactive VAG

.LAF
LAF (Limitless Audio Format)

.LAVFI
Libavfilter virtual input device

.LC3
LC3 (Low Complexity Communication Codec)

.LIVE_FLV
live RTMP FLV (Flash Video)

.LMLM4
raw lmlm4

.LOAS
LOAS AudioSyncStream

.LRC
LRC lyrics

.LUODAT
Video CCTV DAT

.LVF
LVF

.LXF
VR native stream (LXF)

.M4V
raw MPEG-4 video

.MCA
MCA Audio Format

.MCC
MacCaption

.MGSTS
Metal Gear Solid: The Twin Snakes

.MJPG
raw MJPEG video

.MJPEG_2000
raw MJPEG 2000 video

.MLP
raw MLP

.MLV
Magic Lantern Video (MLV)

.MM
American Laser Games MM

.MMF
Yamaha SMAF

.MODS
MobiClip MODS

.MOFLEX
MobiClip MOFLEX

.M4A
MPEG-4 Audio

.3GP
3GPP Multimedia Container

.3G2
3GPP2 Multimedia Container

.MJ2
QuickTime / MOV / mj2

.MPC8
Musepack SV8

.MPG
MPEG-1 Systems / MPEG program stream

.MPEGTSRAW
raw MPEG-TS (MPEG-2 Transport Stream)

.MPEGVIDEO
raw MPEG video

.MJPG
MIME multipart JPEG

.MSF
Sony PS3 MSF

.MSNWCTCP
MSN TCP Webcam stream

.MSP
Microsoft Paint (MSP))

.MTAF
Konami PS2 MTAF

.MTV
MTV

.MULAW
PCM mu-law

.MUSX
Eurocom MUSX

.MV
Silicon Graphics Movie

.MVI
Motion Pixels MVI

.MXF
MXF (Material eXchange Format)

.MXG
MxPEG clip

.NC
NC camera feed

.NISTSPHERE
NIST SPeech HEader REsources

.NSP
Computerized Speech Lab NSP

.NSV
Nullsoft Streaming Video

.NUT
NUT

.NUV
NuppelVideo

.OBU
AV1 low overhead OBU

.OMA
Sony OpenMG audio

.OSQ
raw OSQ

.PAF
Amazing Studio Packed Animation File

.PDV
PlayDate Video

.PMP
Playstation Portable PMP

.PP_BNK
Pro Pinball Series Soundbank

.PSXSTR
Sony Playstation STR

.PVA
TechnoTrend PVA

.PVF
PVF (Portable Voice Format)

.QCP
QCP

.QOA
QOA

.R3D
REDCODE R3D

.RAWVIDEO
raw video

.RCWT
RCWT (Raw Captions With Time)

.REDSPARK
RedSpark

.RKA
RKA (RK Audio)

.RL2
RL2

.RM
RealMedia

.ROQ
raw id RoQ

.RPL
RPL / ARMovie

.RSD
GameCube RSD

.RSO
Lego Mindstorms RSO

.RTP
RTP output

.S16BE
PCM signed 16-bit big-endian

.S16LE
PCM signed 16-bit little-endian

.S24BE
PCM signed 24-bit big-endian

.S24LE
PCM signed 24-bit little-endian

.S32BE
PCM signed 32-bit big-endian

.S32LE
PCM signed 32-bit little-endian

.S337M
SMPTE 337M

.S8
PCM signed 8-bit

.SAP
SAP output

.SBC
raw SBC

.SBG
SBaGen binaural beats script

.SCC
Scenarist Closed Captions

.SCD
Square Enix SCD

.SDNS
Xbox SDNS

.SDP
SDP

.SDR2
SDR2

.SDS
MIDI Sample Dump Standard

.SDX
Sample Dump eXchange

.SER
SER (Simple uncompressed video format for astronomical capturing)

.SGA
Digital Pictures SGA

.SHN
raw Shorten

.SIFF
Beam Software SIFF

.SIMBIOSIS_IMX
Simbiosis Interactive IMX

.SLN
Asterisk raw pcm

.SMJPEG
Loki SDL MJPEG

.SMK
Smacker

.SMUSH
LucasArts Smush

.SOL
Sierra SOL

.SOX
SoX (Sound eXchange) native

.SPDIF
IEC 61937 (used on S/PDIF - IEC958)

.SVAG
Konami PS2 SVAG

.SVS
Square SVS

.SWF
SWF (ShockWave Flash)

.TAK
raw TAK

.TEDCAPTIONS
TED Talks captions

.THP
THP

.TIERTEXSEQ
Tiertex Limited SEQ

.TMV
8088flex TMV

.TRUEHD
raw TrueHD

.TTA
TTA (True Audio)

.TTY
Tele-typewriter

.TXD
Renderware TeXture Dictionary

.TY
TiVo TY Stream

.U16BE
PCM unsigned 16-bit big-endian

.U16LE
PCM unsigned 16-bit little-endian

.U24BE
PCM unsigned 24-bit big-endian

.U24LE
PCM unsigned 24-bit little-endian

.U32BE
PCM unsigned 32-bit big-endian

.U32LE
PCM unsigned 32-bit little-endian

.U8
PCM unsigned 8-bit

.USM
CRI USM

.V210
Uncompressed 4:2:2 10-bit

.V210X
Uncompressed 4:2:2 10-bit

.VAG
Sony PS2 VAG

.VC1
raw VC-1 video

.VC1TEST
VC-1 test bitstream

.VIDC
PCM Archimedes VIDC

.VIVIDAS
Vividas VIV

.VIVO
Vivo

.VMD
Sierra VMD

.VOC
Creative Voice

.VPK
Sony PS2 VPK

.VQF
Nippon Telegraph and Telephone Corporation (NTT) TwinVQ

.VVC
raw H.266/VVC video

.W64
Sony Wave64

.WADY
Marble WADY

.WAVARC
Waveform Archiver

.WC3MOVIE
Wing Commander III movie

.WEBP_ANIM
Animated WebP

.WSAUD
Westwood Studios audio

.WSD
Wideband Single-bit Data (WSD)

.WSVQA
Westwood Studios VQA

.WTV
Windows Television (WTV)

.WV
raw WavPack

.WVE
Psion 3 audio

.XA
Maxis XA

.XBIN
eXtended BINary text (XBIN)

.XMD
Konami XMD

.XMV
Microsoft XMV

.XVAG
Sony PS3 XVAG

.XWMA
Microsoft xWMA

.YOP
Psygnosis YOP

.YUV4MPEGPIPE
YUV4MPEG pipe

.QTA
QuickTime Audio

.WMV
Windows Media Video

.MTS
AVCHD Video

.M2TS
Blu-ray BDMV Video

.ODP
OpenDocument Presentation

.ODS
OpenDocument Spreadsheet

.XPI
Firefox Plugin

.LOVE
LÖVE Game Package

.OSZ
osu! Beatmap

.OSK
osu! Skin

.APWORLD
Archipelago World

.JAR
Java Archive

.APK
Android Package Archive

.SB3
Scratch 3 Project

.IPA
iOS Application

.APP
macOS Application Bundle

.CBR
Comic Book Archive (RAR)

.CB7
Comic Book Archive (7Z)

.YML
YAML Ain't Markup Language

.HAR
HTTP Archive

.PISKEL
Piskel Sprite Save File

.QOI
Quite OK Image

.DEM
Portal 2 Demo File

.GLB
GL Transmission Format Binary

.GLTF
GL Transmission Format

.OBJ
Wavefront OBJ

.STL
Stereolithography

.PLY
Polygon File Format

.FBX
Autodesk FBX

.DAE
COLLADA

.3MF
3D Manufacturing Format

.DB
SQLite3

.ITDB
iTunes Database

.VTF
Valve Texture Format

.DAT
Minecraft Map File

.7Z
7z archive

.APFS
APFS archive

.APM
APM archive

.AR
Ar archive

.ARJ
Arj archive

.B64
Base64 archive

.CAB
Cab archive

.CHM
Chm archive

.MSI
Compound archive

.CPIO
Cpio archive

.CRAMFS
CramFS archive

.DMG
Dmg archive

.ELF
ELF archive

.EXT
Ext archive

.FAT
FAT archive

.GPT
GPT archive

.HFS
HFS archive

.HXS
Hxs archive

.IHEX
IHex archive

.ISO
Iso archive

.LPIMG
LP archive

.LZH
Lzh archive

.MBR
MBR archive

.MACHO
MachO archive

.MSLZ
MsLZ archive

.MUB
Mub archive

.NTFS
NTFS archive

.NSIS
Nsis archive

.EXE
PE archive

.PMD
Ppmd archive

.QCOW
QCOW archive

.RAR
Rar archive

.RPM
Rpm archive

.SIMG
Sparse archive

.001
Split archive

.SQUASHFS
SquashFS archive

.TE
TE archive

.SCAP
UEFIc archive

.UEFIF
UEFIf archive

.UDF
Udf archive

.VDI
VDI archive

.VHD
VHD archive

.VHDX
VHDX archive

.VMDK
VMDK archive

.XAR
Xar archive

.Z
Z compressed tar archive

.BZ2
bzip2 compressed tar archive

.GZ
gzip compressed tar archive

.LZMA
lzma archive

.LZMA86
lzma86 archive

.WIM
wim archive

.XZ
xz compressed tar archive

.ZST
zstd compressed tar archive

.JSON5
JSON5

.JSONC
JSON Comments

.TOML
Tom's Obvious, Minimal Language

.INI
Initialization file

.ALS
Ableton Live Set

.JSONL
JSON Lines

.NBT
Named Binary Tag

.SNBT
String Named Binary Tag

.DLL
Dynamic-Link Library

.FLP
FL Studio Project File

.FLO
Flo Audio

.PNG
iPhone optimized CgBI PNG

.BAT
Windows Batch file

.TXT
Plain Text (UTF-16 LE)

.TXT
Plain Text (UTF-16 BE)

.TXT
Plain Text (UTF-32 LE)

.TXT
Plain Text (UTF-32 BE)

.C
C Source File

.MPTM
OpenMPT Module

.MOD
Amiga MOD

.S3M
Scream Tracker 3 Module

.XM
FastTracker 2 Extended Module

.IT
Impulse Tracker Module

.667
UNIS 669 Composer Module

.669
UNIS 669 Composer Module

.AMF
ASYLUM / DSMI Advanced Module Format

.AMS
Extreme Tracker / Velvet Studio Module

.C67
CDFM / Composer 670 Module

.CBA
Chuck Biscuits AmigaTracker Module

.DBM
DigiBooster Pro Module

.DIGI
Digital Tracker Module

.DMF
X-Tracker Module

.DSM
DSIK Module

.DSYM
Digital Symphony Module

.DTM
Digital Tracker Module

.ETX
Estrayk Tracker Module

.FAR
Farandole Composer Module

.FC
Future Composer Module

.FC13
Future Composer 1.3 Module

.FC14
Future Composer 1.4 Module

.FMT
FM Tracker Module

.FST
Future Composer BSI Module

.FTM
Face The Music Module

.GDM
General Digital Music Module

.GMC
Game Music Creator Module

.GTK
Graoumf Tracker Module

.GT2
Graoumf Tracker 2 Module

.ICE
Imago Orpheus Module

.IMF
Imago Orpheus Module

.IMS
Images Music System Module

.J2B
GALAXY Music System / Jazz Jackrabbit 2 Module

.M15
Ultimate Soundtracker Module

.MDL
DigiTrakker Module

.MED
OctaMED Module

.MMCMP
Memory Music Compression Module

.MMS
MultiMedia Sound Module

.MO3
MO3 Module

.MT2
MadTracker 2 Module

.MTM
MultiTracker Module

.MUS
Doom / Heretic / Hexen MUS Module

.NST
NoiseTracker Module

.OKT
Oktalyzer Module

.OXM
OpenXM Module

.PLM
Disorder Tracker 2 Module

.PSM
Protracker Studio Module

.PT36
Protracker 3.6 Module

.PTM
PolyTracker Module

.PUMA
Puma Tracker Module

.PPM
Disorder Tracker Module

.RTM
Real Tracker Module

.SFX
SoundFX Module

.SFX2
SoundFX 2 Module

.SMOD
Soundtracker Module

.ST26
Soundtracker 2.6 Module

.STK
Soundtracker Module

.STM
Scream Tracker 2 Module

.STX
Scream Tracker Music Interface Kit

.STP
Soundtracker Pro II Module

.SYMMOD
Symphonie Module

.TCB
TC Browser Module

.ULT
UltraTracker Module

.UMX
Unreal Music Package

.UNIC
UNIC Tracker Module

.WOW
Grave Composer Module

.XMF
Extensible Music Format

.XPK
XPKF/SQSH Compressed Module

.MID
MIDI

.RTTTL
RTTTL

.GRUB
GRUB Init Tune

.WAD
Doom WAD Archive

.IC
Infinite Craft Save File

.BSOR
Beat Saber Open Replay

.TTF
TrueType Font

.OTF
OpenType Font

.WOFF
Web Open Font Format

.WOFF2
Web Open Font Format 2.0

.ICNS
Apple Icon Image

.SCHEMATIC
Minecraft Schematic

.SCHEM
Sponge Schematic

.LITEMATIC
Litematica Schematic

.BSON
Binary JSON

.Z64
Nintendo 64 ROM (Big Endian)

.N64
Nintendo 64 ROM (Little Endian)

.V64
Nintendo 64 ROM (Byte-swapped)

.MUSICXML
MusicXML

.MXL
MusicXML Compressed

.TOON
Token-Oriented Object Notation

.RPGMVP
RPG Maker MV PNG (RPGMVP)

.OTB
Over The Air bitmap

.WLD
Terraria World

.PUZZLE
Opus Magnum puzzle

.MOLECULE
Opus Magnum molecule

.APF
Aperture Picture Format

.XCF
eXperimental Computing Facility (GIMP)

.PDF
Portable Document Format

.MOBI
Mobipocket e-book

.HWPX
Hancom Office Hangul Document

.JXR
JPEG XR

.JB2
Joint Bi-level Image experts Group (JBIG2)

.PKM
Portable arbitrary map (CMYK)

.PCLM
PCLm raster

.XHTML
Extensible Hypertext Markup Language

.LANG
Minecraft Language Localization File

.ECMAP
Editable Celaria Map

.CMAP
Celaria Map

.WASM
WebAssembly Binary (Wasm)

.WAT
WebAssembly Text Format (WAT)

.FEN
Forsyth–Edwards Notation

.PGN
Portable Game Notation

.
X11 cursor

.SH
Shell Script

.CSS
CSS Stylesheet

.LESS
LESS Stylesheet

.SCSS
SCSS Stylesheet

.BBMODEL
Blockbench Project

.KRA
Krita Raster Archive (KRA)

.KRZ
Krita Raster Archive (krz)

.BRARCHIVE
Minecraft Bedrock Archive

.CPP
C++ Source File

.S
WebAssembly Assembly Source File

.S
x86-64 Linux Assembly Source File

.S
x86 Linux Assembly Source File

.S
ARM64 Linux Assembly Source File

.S
ARM Linux Assembly Source File

.S
RISC-V 64-bit Linux Assembly Source File

.S
x86-64 Windows Assembly Source File

.S
x86 Windows Assembly Source File

.S
ARM64 Windows Assembly Source File

.S
ARM Windows Assembly Source File

.MRPACK
Modrinth Modpack

.AZW3
Amazon Kindle Format 8
`;

// Parse lines into items: ext, name
const lines = rawList.trim().split('\n').map(l => l.trim()).filter(Boolean);
const items = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('.')) {
    const ext = lines[i];
    const name = lines[i+1] || ext;
    items.push({ ext, name });
    i++;
  }
}

const file = fs.readFileSync('src/engine/formats.ts', 'utf8');

// Get all keys defined in FORMATS: "key": {
const definedKeys = new Set();
const keyRegex = /^\s*"([a-zA-Z0-9_\.\-]+)":\s*\{/gm;
let m;
while ((m = keyRegex.exec(file)) !== null) {
  definedKeys.add(m[1].toLowerCase());
}

// Also get all extensions in formats.ts
const definedExts = new Set();
const extMatch = file.matchAll(/extension:\s*"([^"]+)"/g);
for (const match of extMatch) {
  definedExts.add(match[1].toLowerCase());
}

console.log('Total items in user list:', items.length);

const missing = [];
for (const item of items) {
  const extClean = item.ext.toLowerCase();
  const idClean = extClean.replace(/^\./, '');
  if (!definedExts.has(extClean) && !definedKeys.has(idClean)) {
    missing.push(item);
  }
}

console.log('Missing items count:', missing.length);
console.log('Missing items:', JSON.stringify(missing, null, 2));
