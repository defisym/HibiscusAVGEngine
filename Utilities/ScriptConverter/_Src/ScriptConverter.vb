Sub 导演代码转换()
'
' 导演代码转换
' 将原始文本转换为导演代码格式
'
    ' 清除选中区域格式
    Selection.Find.ClearFormatting
    Selection.Find.Replacement.ClearFormatting
    
    ' 匹配文本
        ' 匹配带有演出提示的对白文本，并替换
        With Selection.Find
            .Text = "【([!^13]@)】([!^13]@)[^13]@" & ChrW(8220) & "([!^13]@)" & ChrW( _
                8221)
            .Replacement.Text = "( ↓\2^13\1:\3"
            .Forward = True

            ' 若需要替换全部文本，则将本行
            ' .Wrap = wdFindStop
            ' 替换为
            ' .Wrap = wdFindContinue
            ' 参考 : https://docs.microsoft.com/zh-cn/office/vba/api/word.wdfindwrap

            .Wrap = wdFindStop
            .Format = False
            .MatchCase = False
            .MatchWholeWord = False
            .MatchByte = False
            .MatchAllWordForms = False
            .MatchSoundsLike = False
            .MatchWildcards = True
        End With
        Selection.Find.Execute Replace:=wdReplaceAll


        ' 匹配不带有演出提示的对白文本，并替换
        With Selection.Find
            .Text = "【([!^13]@)】[^13]@" & ChrW(8220) & "([!^13]@)" & ChrW(8221)
            .Replacement.Text = "\1:\2"
            .Forward = True
            .Wrap = wdFindStop
            .Format = False
            .MatchCase = False
            .MatchWholeWord = False
            .MatchByte = False
            .MatchAllWordForms = False
            .MatchSoundsLike = False
            .MatchWildcards = True
        End With
        Selection.Find.Execute Replace:=wdReplaceAll
    
    ' 匹配演出提示      

        ' 匹配MarkDown短信演出提示，并转换

            ' 短信开始"
            With Selection.Find
                .Text = "【FG 手机屏幕】（短信|备注：([!）]@)）^13"
                .Replacement.Text = "【\1短信开始】^13@CallPhone:0:0:\1:-1:-1^13@LockMouseinPhoneRect^13@UnlockPhone^13"                
                .Forward = True
                .Wrap = wdFindStop
                .Format = False
                .MatchCase = False
                .MatchWholeWord = False
                .MatchByte = False
                .MatchAllWordForms = False
                .MatchSoundsLike = False
                .MatchWildcards = True
            End With
            Selection.Find.Execute Replace:=wdReplaceAll

            ' 短信结束"
            With Selection.Find
                .Text = "【FG 手机屏幕】（前景撤销）^13"
                .Replacement.Text = "@LockPhone^13@ClosePhone^13@UnlockMouse^13【短信结束】^13"                
                .Forward = True
                .Wrap = wdFindStop
                .Format = False
                .MatchCase = False
                .MatchWholeWord = False
                .MatchByte = False
                .MatchAllWordForms = False
                .MatchSoundsLike = False
                .MatchWildcards = True
            End With
            Selection.Find.Execute Replace:=wdReplaceAll  

            ' MarkDown表格表头"|||"
            With Selection.Find
                .Text = "|||^13"
                .Replacement.Text = ""
                .Forward = True
                .Wrap = wdFindStop
                .Format = False
                .MatchCase = False
                .MatchWholeWord = False
                .MatchByte = False
                .MatchAllWordForms = False
                .MatchSoundsLike = False
                .MatchWildcards = True
            End With
            Selection.Find.Execute Replace:=wdReplaceAll

            ' MarkDown表格格式"|:---|---:|"
            With Selection.Find
                .Text = "|:---|---:|^13"
                .Replacement.Text = ""
                .Forward = True
                .Wrap = wdFindStop
                .Format = False
                .MatchCase = False
                .MatchWholeWord = False
                .MatchByte = False
                .MatchAllWordForms = False
                .MatchSoundsLike = False
                .MatchWildcards = True
            End With
            Selection.Find.Execute Replace:=wdReplaceAll

            ' R短信
            With Selection.Find
                .Text = "\|\|\{([!^13]@)\}^13"
                .Replacement.Text = "^t@PhoneMSG:R:\1^13"
                .Forward = True
                .Wrap = wdFindStop
                .Format = False
                .MatchCase = False
                .MatchWholeWord = False
                .MatchByte = False
                .MatchAllWordForms = False
                .MatchSoundsLike = False
                .MatchWildcards = True
            End With
            Selection.Find.Execute Replace:=wdReplaceAll

            ' L短信
            With Selection.Find
                .Text = "\|\{([!^13]@)\}^13"
                .Replacement.Text = "^t@PhoneMSG:L:\1^13"
                .Forward = True
                .Wrap = wdFindStop
                .Format = False
                .MatchCase = False
                .MatchWholeWord = False
                .MatchByte = False
                .MatchAllWordForms = False
                .MatchSoundsLike = False
                .MatchWildcards = True
            End With
            Selection.Find.Execute Replace:=wdReplaceAll

        ' 匹配原始短信演出提示，并注释
        With Selection.Find
            .Text = "\{([!^13]@)^13"
            .Replacement.Text = "( {\1^13"
            .Forward = True
            .Wrap = wdFindStop
            .Format = False
            .MatchCase = False
            .MatchWholeWord = False
            .MatchByte = False
            .MatchAllWordForms = False
            .MatchSoundsLike = False
            .MatchWildcards = True
        End With
        Selection.Find.Execute Replace:=wdReplaceAll

        ' 匹配演出提示，并注释
        With Selection.Find
            .Text = "【([!^13]@)^13"
            .Replacement.Text = "( 【\1^13"
            .Forward = True
            .Wrap = wdFindStop
            .Format = False
            .MatchCase = False
            .MatchWholeWord = False
            .MatchByte = False
            .MatchAllWordForms = False
            .MatchSoundsLike = False
            .MatchWildcards = True
        End With
        Selection.Find.Execute Replace:=wdReplaceAll        


        ' 匹配其他演出备注格式，，并注释
        ' 待添加
        ' ……

End Sub
